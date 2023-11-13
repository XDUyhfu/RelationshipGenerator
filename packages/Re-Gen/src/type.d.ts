import type {
    BehaviorSubject,
    Observable,
    ObservableInput,
    ReplaySubject,
} from "rxjs";
import type { FilterNilStage, CombineType } from "./config";

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
      }
    | undefined;

export type InitFunctionType = (
    ...args: any[]
) => Promise<any> | Observable<any> | PlainResult;

export type IConfigItemInit =
    | Promise<any>
    | Observable<any>
    | PlainResult
    | InitFunctionType;

export interface IConfigItem<Name extends string = string> {
    name: Name;
    init?: IConfigItemInit;
    handle?: (arg: any) => ReturnResult;
    depend?: {
        names: string[];
        handle: (
            current: any,
            isChange: Record<string, boolean>,
            beforeAndCurrent: [any, any],
        ) => ReturnResult;
        combineType?: CombineType;
    };
    reduce?: {
        handle: (pre: any, cur: any) => ReturnResult;
        init: any;
    };
    distinct?: IDistinct;
    /**
     *  如果正常使用该库的话，应该不会使用到该配置项
     *  但是在使用该库封装一些组件之类的时候，或许会有很作用
     *  例如：插入用户的逻辑
     */
    interceptor?: {
        before?: (arg: any) => ReturnResult;
        after?: (arg: any) => ReturnResult;
    };
    filterNil?: FilterNilStage | boolean;
    /**
     * 结果是否携带 timestamp 信息，主要用于在两次流经值相同的情况下，用于判断该值是否发生了变化
     */
    timestamp?: boolean;
}

export interface ReGenConfig {
    /**
     * 默认为 Default 配置
     */
    filterNil?: FilterNilStage | boolean;
    distinct?: boolean;
    init?: Record<string, any>;
    /**
     * 结果是否携带 timestamp 信息，主要用于在两次流经值相同的情况下，用于判断该值是否发生了变化
     */
    timestamp?: boolean;
    async?: boolean;
}

export type IAtomInOut = (name: string) => {
    [x: `${string}Out$`]: BehaviorSubject<any>;
    [y: `${string}In$`]: ReplaySubject<any>;
};

/**
 * 后两种方式一般情况下是不会使用到的，主要当你要将多个 Config 封装到一起的时候，可能会用到这种方式
 */
export type IRelationConfig =
    | IConfigItem[]
    | IConfigItem[][]
    | Record<string, IConfigItem[]>
    | Record<string, IConfigItem[][]>;

export type OperatorReturnType = (source: Observable<any>) => Observable<any>;
