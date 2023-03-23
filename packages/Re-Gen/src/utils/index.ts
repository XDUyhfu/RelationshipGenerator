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
import { forEach, isEmpty, isNil } from "ramda";
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

export const SetAtomValueByKey = (cacheKey: string, name: string, value: any) =>
    GetAtomIn(cacheKey)?.[name]?.next(value);

export const PluckValue = (config: IConfigItem[]): PluckValueType[] =>
    config.map((item: IConfigItem) => ({ init: item.init, name: item.name }));
