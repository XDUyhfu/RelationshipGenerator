import { BehaviorSubject, Observable, ObservableInput } from "rxjs";

export type PlainResult =
    | Record<string, any>
    | number
    | string
    | boolean
    | undefined
    | null;
export type RxResult = ObservableInput<any>;

export type ReturnResult = PlainResult | RxResult;

export type IDistinct<T, K> =
    | boolean
    | {
          comparator: (previous: K, current: K) => boolean;
          keySelector?: (value: T) => K;
      };

export type CombineType = "self" | "any" | "every";

export type InitFunctionType = (
    ...args: any[]
) => Promise | Observable | PlainResult;

export interface IConfigItem {
    name: string;
    init?: Promise | Observable | PlainResult | InitFunctionType;
    handle?: (arg: any) => ReturnResult;
    distinct?: IDistinct;
    reduce?: {
        handle: (pre: any, val: any) => any;
        init: any;
    };
    filterNil?: FilterNilOption;
    depend?: {
        names: string[];
        handle: (args: any) => ReturnResult;
        combineType?: CombineType;
    };
}

export type AnyObservable = Observable<any>;
export type AnyBehaviorSubject = BehaviorSubject<any>;
export type AnyArray = Array<any>;
export type AnyPromise = Promise<any>;
export type AtomsType = Record<string, AnyBehaviorSubject>;
export type ReGenParam = {
    atoms: AnyBehaviorSubject;
};

export interface ReGenOptions {
    /**
     * 是否开启logger
     */
    logger?: LoggerOption;

    /**
     * 默认为 Default 配置
     */
    filterNil?: FilterNilOption;
    distinct?: boolean;
}

export type LoggerOption = boolean | { duration?: number };
export type FilterNilOption =
    | "All"
    | "Default"
    | "In"
    | "HandleAfter"
    | "DependAfter"
    | "Out";

// -- in -- handle -- depend -- reduce -- out --
export type TransformStage =
    | "InBefore"
    | "In"
    | "InAfter"
    | "HandleBefore"
    | "Handle"
    | "HandleAfter"
    | "DependBefore"
    | "Depend"
    | "DependAfter"
    | "ReduceBefore"
    | "Reduce"
    | "ReduceAfter"
    | "OutBefore"
    | "Out"
    | "OutAfter";
