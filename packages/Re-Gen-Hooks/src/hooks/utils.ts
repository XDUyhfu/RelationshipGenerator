import { isObservable, ObservableInput } from "rxjs";

export type PlainResult =
    | Record<string, any>
    | number
    | string
    | boolean
    | undefined
    | null;
export type RxResult = ObservableInput<any>;

export type ReturnResult = PlainResult | RxResult;

export type AnyArray = Array<any>;
export type AnyPromise = Promise<any>;

export const isPromise = (value: any): value is AnyPromise =>
    value instanceof Promise;

export const isArray = (value: any): value is AnyArray => Array.isArray(value);
export const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value); // Observable 也是一个 Object 类型
export const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isObject(result) ||
    Array.isArray(result) ||
    result === null;
