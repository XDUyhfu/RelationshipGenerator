import { Observable, ObservableInput } from "rxjs";
import { FilterNilStage, CombineType } from "./config";

export type PlainResult =
    | Record<string, any>
    | number
    | string
    | boolean
    | undefined
    | null;
export type RxResult = ObservableInput<any>;

export type ReturnResult = PlainResult | RxResult;

export type IDistinct<T = any, K = any> =
    | boolean
    | {
          comparator: (previous: K, current: K) => boolean;
          keySelector?: (value: T) => K;
      } | undefined;

export type InitFunctionType = (
    ...args: any[]
) => Promise<any> | Observable<any> | PlainResult;

export type IConfigItemInit = Promise<any> | Observable<any> | PlainResult | InitFunctionType

export interface IConfigItem {
    name: string;
    init?: IConfigItemInit;
    handle?: (arg: any) => ReturnResult;
    distinct?: IDistinct;
    reduce?: {
        handle: (pre: any, val: any) => any;
        init: any;
    };
    filterNil?: FilterNilStage | boolean;
    depend?: {
        names: string[];
        handle: (args: any) => ReturnResult;
        combineType?: CombineType;
    };
}

export type AtomsType = Record<string, AnyBehaviorSubject>;

export type PluckValueType = {
    name: string;
    init: IConfigItemInit;
};

export interface ReGenConfig {
    /**
     * 是否开启logger
     * - 日志持续的时间或者使用默认时间
     */
    logger?: { duration?: number } | boolean | number;
    /**
     * 默认为 Default 配置
     */
    filterNil?: FilterNilStage | boolean;
    distinct?: boolean;
}

