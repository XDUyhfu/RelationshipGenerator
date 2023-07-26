import { Observable, ObservableInput } from "rxjs";
import { FilterNilStage, CombineType } from "./config";

type PlainResult =
    | Record<string, any>
    | number
    | string
    | boolean
    | undefined
    | null;

type RxResult = ObservableInput<any>;

type ReturnResult = PlainResult | RxResult;

type IDistinct<T = any, K = any> =
    | boolean
    | {
          comparator: (previous: K, current: K) => boolean;
          keySelector?: (value: T) => K;
      } | undefined;

type InitFunctionType = (
    ...args: any[]
) => Promise<any> | Observable<any> | PlainResult;

export type IConfigItemInit = Promise<any> | Observable<any> | PlainResult | InitFunctionType

export interface IConfigItem {
    name: string;
    init?: IConfigItemInit;
    handle?: (arg: any) => ReturnResult;
    depend?: {
        names: string[];
        handle: (args: any) => ReturnResult;
        combineType?: CombineType;
    };
    reduce?: {
        handle: (pre: any, val: any) => ReturnResult;
        init: any;
    };
    distinct?: IDistinct;
    // 如果正常使用该库的话，应该不会使用到该配置项
    // 但是在使用该库封装一些组件之类的时候，或许会有很作用
    // 例如：插入用户的逻辑
    interceptor?: {
        before?: ( arg: any ) => ReturnResult;
        after?: ( arg: any ) => ReturnResult;
    };
    filterNil?: FilterNilStage | boolean;
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

export type IAtomInOut = (name: string) => {[p: `${string}In$`]: BehaviorSubject<any>, [p: `${string}Out$`]: BehaviorSubject<any>}
export type IRelationConfig = IConfigItem[] | IConfigItem[][]
