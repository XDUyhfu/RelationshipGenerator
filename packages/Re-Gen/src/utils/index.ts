import { isObservable } from "rxjs";
import { ObservableInput, of } from "rxjs";
import {
    IConfigItem,
    IDistinct,
    FilterNilOption,
    ReturnResult,
    TransformStage,
    ReGenOptions,
    PluckValueType,
    AnyArray,
    AnyPromise,
    PlainResult,
} from "../type";
import {
    DistinctDefaultValue,
    FilterNilDefaultValue,
    FilterNilOptionDefaultValue,
    FilterNilStageDefaultValue,
    RxjsWaterDurationDefaultValue,
} from "../config";
import {
    complement,
    compose,
    forEach,
    is,
    isEmpty,
    isNil,
    pluck,
    length,
    not,
    equals,
    filter,
} from "ramda";
import { GetAtomIn, GlobalLoggerWatcher } from "../Atom";
import { getGroup } from "rxjs-watcher";

export const isPromise = (value: any): value is AnyPromise =>
    value instanceof Promise;

export const isArray = (value: any): value is AnyArray => Array.isArray(value);
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

export const transformResultToObservable = (
    result: ReturnResult
): ObservableInput<any> =>
    isPlainResult(result)
        ? of(result)
        : isObject(result)
        ? of(result)
        : (result as ObservableInput<any>);

export const transformFilterNilOptionToBoolean: (
    stage: TransformStage,
    nilOption: FilterNilOption
) => boolean = (stage, nilOption) => {
    if (stage === nilOption) {
        return true;
    }
    if (nilOption === "All") {
        return true;
    }
    if (
        nilOption === FilterNilOptionDefaultValue &&
        FilterNilStageDefaultValue.includes(stage)
    ) {
        return FilterNilDefaultValue;
    }
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

export const JudgeRepetition = () => (RelationConfig: IConfigItem[]) =>
    forEach((item: IConfigItem) => {
        if (isEmpty(item.name) || isNil(item.name)) {
            throw new Error(`${item.name}: 无效的 name 属性`);
        }

        if (RelationConfig.filter((it) => it.name === item.name).length > 1) {
            throw new Error(`${item.name}: 重复的 name 属性`);
        }
    })(RelationConfig);

export const DependencyDetection = () => (RelationConfig: IConfigItem[]) =>
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

export const OpenLogger =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) => {
        if (!GlobalLoggerWatcher.has(cacheKey) && !!_options?.logger) {
            GlobalLoggerWatcher.set(
                cacheKey,
                getGroup(
                    `${cacheKey} Watcher Group`,
                    typeof _options?.logger === "boolean"
                        ? RxjsWaterDurationDefaultValue
                        : _options.logger?.duration
                )
            );
        }
        return RelationConfig;
    };

export const SetAtomValueByKey =
    (cacheKey: string) => (name: string, value: any) =>
        GetAtomIn(cacheKey)?.[name]?.next(value);

export const PluckValue = (config: IConfigItem[]): PluckValueType[] =>
    config.map((item: IConfigItem) => ({ init: item?.init, name: item?.name }));


// 检查 ReGen 函数参数
export const CheckReGenParams = (cacheKey: string, RelationConfig: IConfigItem[]) => {
    // 判断条件：
    // cacheKey是一个有效的字符串
    // RelationConfig 长度大于 0
    // RelationConfig 数组中每一项都一个有效的name值
    const isNotEmpty = complement(isEmpty);
    if (not(is(String, cacheKey) && isNotEmpty(cacheKey))) {
         throw new Error("cacheKey 需要为字符串类型且长度大于0");
    }
    if (not(is(Array, RelationConfig) && isNotEmpty(RelationConfig))) {
        throw new Error("RelationConfig 需要为数据类型且长度大于0");
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pluckName = compose(filter(isNotEmpty), pluck("name"));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (not(equals(length(pluckName(RelationConfig)), length(RelationConfig)))) {
        throw new Error("RelationConfig 中存在无效的 name 属性");
    }
};
