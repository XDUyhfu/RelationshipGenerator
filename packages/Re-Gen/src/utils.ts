import { of } from "rxjs";
import {
    IConfigItem,
    IDistinct,
    FilterNilOption,
    ReturnResult,
    TransformStage,
} from "./type";
import { isObject, isPlainResult } from "@yhfu/re-gen-utils";
import { DistinctDefaultValue, NilOptionDefaultValue } from "./config";
import { forEach, isEmpty, isNil } from "ramda";

export const getDependNames = (item: IConfigItem) => item.depend?.names || [];
export const defaultReduceFunction = (_: any, val: any) => val;

export const transformResultToObservable = (result: ReturnResult) =>
    isPlainResult(result) ? of(result) : isObject(result) ? of(result) : result;

export const transformFilterNilOptionToBoolean: (
    stage: TransformStage,
    globalNil: FilterNilOption,
    itemNil: boolean | undefined
) => boolean = (stage, global, item) => {
    // 这个策略要重新定义一下
    if (typeof item === "boolean") {
        return item;
    }
    if (global === false) {
        return false;
    }
    if (global === "all") {
        return true;
    }

    if (stage === "In" && global === "default") {
        return NilOptionDefaultValue;
    }
    if (stage === "In" && global === true) {
        return true;
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