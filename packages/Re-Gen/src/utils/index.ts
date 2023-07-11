import { isObservable } from "rxjs";
import { ObservableInput, of } from "rxjs";
import {
    IConfigItem,
    IDistinct,
    ReturnResult,
    ReGenConfig,
    PluckValueType,
    PlainResult,
} from "../type";
import {
    DistinctDefaultValue,
    LoggerDurationDefaultValue,
    FilterNilDefaultConfig,
    FilterNilStage,
    ReGenPrefix,
} from "../config";
import {
    complement,
    forEach,
    is,
    isEmpty,
    isNil,
    not,
} from "ramda";
import { getGroup } from "rxjs-watcher";
import { Global } from "../store";

export const isArray = (value: any): value is Array<any> => Array.isArray(value);
export const isPlainObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    value?.constructor === Object;
export const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value);
export const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isPlainObject(result) ||
    Array.isArray(result) ||
    result === null;

export const getDependNames = (item: IConfigItem) => item.depend?.names || [];
export const defaultReduceFunction = (_: any, val: any) => val;

/**
 * 将值转换成 ObservableInput, 从而使用 RxJS 进行处理
 * @param result
 */
export const transformResultToObservable = (
    result: ReturnResult
): ObservableInput<any> => isPlainResult( result ) ? of( result ) : isObject( result ) ? of( result ) : (result as ObservableInput<any>);

/**
 * 根据用户传入的条件判断是否对空值进行过滤
 * - 支持传入布尔值或过滤阶段
 * @param stage 当前所处于的阶段
 * @param nilOption 空值过滤的选项
 */
export const transformFilterNilOptionToBoolean: (
    stage: FilterNilStage,
    nilOption?: FilterNilStage | boolean
) => boolean = (stage, nilOption) => {
    if (stage === nilOption || nilOption === FilterNilStage.All || nilOption) {
        return true;
    }
    // 如果没有传入过滤空值的相关配置，则采用默认的处理方式
    if (
        isNil(nilOption) &&
        FilterNilDefaultConfig.Stage.includes(stage)
    ) {
        return FilterNilDefaultConfig.Value;
    }
    // 如果传入的 nilOption 为 false，也会返回false
    return false;
};

export const transformDistinctOptionToBoolean: (
    globalDistinct: boolean | undefined,
    itemDistinct: IDistinct<any, any>
) => boolean | IDistinct<any, any> = (global, item) => {
    if (typeof item === "boolean" || typeof item === "object") {
        return item;
    }
    return global ?? DistinctDefaultValue;
};

export const OpenLogger =
    (CacheKey: string, config?: ReGenConfig) =>
    (RelationConfig: IConfigItem[]) => {
        if (!Global.LoggerWatcher.has(CacheKey) && !!config?.logger) {
            Global.LoggerWatcher.set(
                CacheKey,
                getGroup(
                    `${CacheKey} Watcher Group`,
                    typeof config?.logger === "boolean"
                        ? LoggerDurationDefaultValue
                        : typeof config?.logger === "number"
                            ? config.logger
                        : config.logger?.duration
                )
            );
        }
        return RelationConfig;
    };

export const PluckValue = (config: IConfigItem[]): PluckValueType[] =>
    config.map(item => ({ init: item?.init, name: item?.name }));
export const PluckName = (config: IConfigItem[]): string[] => config.map(item => item.name);
const isNotEmpty = complement(isEmpty);

const JudgeRepetition = (RelationConfig: IConfigItem[]) =>
    forEach((item: IConfigItem) => {
        if (isEmpty(item.name) || isNil(item.name)) {
            throw new Error(`${item.name}: 无效的 name 属性`);
        }

        if (RelationConfig.filter((it) => it.name === item.name).length > 1) {
            throw new Error(`${item.name}: 重复的 name 属性`);
        }
    })(RelationConfig);

export const CheckCacheKey = (CacheKey: string) => {
    if (not(is(String, CacheKey) && isNotEmpty(CacheKey))) {
        throw new Error("cacheKey 需要为字符串类型且长度大于0");
    }
    return true;
};

// 检查 ReGen 函数参数
const CheckReGenParams = (CacheKey: string, RelationConfig: IConfigItem[], entry: "hook" | "library") => {
    // 对 JudgeRepetition 的补充
    // 判断条件：
    // cacheKey是一个有效的字符串
    // RelationConfig 长度大于 0
    CheckCacheKey(CacheKey);
    if (entry === "hook") {
        if (not(isArray(RelationConfig) && isNotEmpty(RelationConfig))) {
            throw new Error("RelationConfig 需要为数组类型且长度大于0");
        }
    } else if (entry === "library") {
        if (not(isArray(RelationConfig))) {
            throw new Error("RelationConfig 需要为数组类型");
        }
    }
};

export const DependencyDetection = (RelationConfig: IConfigItem[]) =>
    forEach((item: IConfigItem) => {
        const dependNames = getDependNames(item);
        if (dependNames.includes(item.name)) {
            throw Error(`${item.name} 依赖了自己`);
        }
        dependNames.forEach((name) => {
            if (RelationConfig.filter((it) => it.name === name).length === 0) {
                throw Error(`${item.name} 的依赖项 ${name} 不存在`);
            }
        });
    })(RelationConfig);

export const CheckParams = (CacheKey: string, RelationConfig: IConfigItem[], entry: "hook" | "library") => {
    // 参数检查在 hook 中，配置项不能为空，在使用函数时可以为空，如果为空将不会对 CacheKey 进行存储
    CheckReGenParams(CacheKey, RelationConfig, entry);
    // 下面这两个判断是不论什么场景都需要进行判断的
    JudgeRepetition(RelationConfig);
    DependencyDetection(RelationConfig);
};

/**
 * 正确的格式是: prefix:CacheKey:name
 * @param joint
 */
export const isJointAtom = (joint: any) => {
    if (is(String, joint)) {
        if (joint.startsWith(`${ReGenPrefix}:`)) {
            const rest = joint.replace(`${ReGenPrefix}:`, "").split(":");
            if (rest.length === 2) {
                if (rest[0].length > 0 && rest[1].length > 0) {
                    return rest;
                }
            }
        }
    }

    return false;
};


