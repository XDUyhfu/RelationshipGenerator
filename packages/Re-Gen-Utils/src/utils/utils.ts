import { isObservable } from "rxjs";

import type {
    AnyArray,
    AnyPromise,
    PlainResult,
    ReturnResult,
} from "@yhfu/re-gen";

export const isPromise = (value: any): value is AnyPromise =>
    value instanceof Promise;

export const isArray = (value: any): value is AnyArray => Array.isArray(value);
export const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value);
export const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isObject(result) ||
    Array.isArray(result) ||
    result === null;
