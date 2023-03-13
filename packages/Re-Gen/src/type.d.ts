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

export interface IConfigItem {
    name: string;
    init: Promise | Observable | PlainResult;
    handle?: (arg: any) => ReturnResult;
    distinct?: IDistinct;
    reduce?: (pre: any, val: any) => any;
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

export interface ReGenOptions {
    // 是否开启logger
    logger?: LoggerOption;
}

export type LoggerOption = boolean | { duration?: number };
