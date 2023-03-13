import {
    Observable,
    isObservable,
    of,
    distinctUntilChanged,
    identity,
    combineLatestWith,
    withLatestFrom,
    catchError,
    EMPTY,
    zipWith,
} from "rxjs";
import {
    AnyArray,
    AnyBehaviorSubject,
    AnyObservable,
    AnyPromise,
    CombineType,
    IConfigItem,
    IDistinct,
    LoggerOption,
    PlainResult,
    ReturnResult,
} from "../type";
import { filter, isNil, not, compose } from "ramda";
import { GlobalLoggerWatcher } from "../Atom";

export const getDependNames = (item: IConfigItem) => item.depend?.names || [];
export const defaultReduceFunction = (_: any, val: any) => val;

const removeObjectOrListUndefinedValue = filter(compose(not, isNil));

const isPromise = (value: any): value is AnyPromise => value instanceof Promise;

const isArray = (value: any): value is AnyArray => Array.isArray(value);
const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value); // Observable 也是一个 Object 类型
const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isObject(result) ||
    Array.isArray(result) ||
    result === null;

export const removeUndefined = (value: any) =>
    isObject(value) || isArray(value)
        ? removeObjectOrListUndefinedValue(value)
        : value;

export const handleResult = (result: ReturnResult) =>
    isPlainResult(result) ? of(removeUndefined(result)) : result;

export const handleObservable: () => (source: AnyObservable) => AnyObservable =
    () => (source) =>
        new Observable((observer) => {
            source.subscribe({
                next: (value) => {
                    if (isObservable(value)) {
                        value.subscribe((val) => {
                            observer.next(val);
                        });
                    } else {
                        observer.next(value);
                    }
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            });
        });

export const handlePromise: () => (source: AnyObservable) => AnyObservable =
    () => (source) =>
        new Observable((observer) => {
            source.subscribe({
                next: (value) => {
                    // 如果 value 是 Promise 对象，则转换成 Observable 并订阅
                    if (isPromise(value)) {
                        value
                            .then((val) => {
                                observer.next(val);
                            })
                            .catch((err) => {
                                throw new Error(
                                    "init value Promise error",
                                    err
                                );
                            });
                    } else {
                        observer.next(value);
                    }
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            });
        });

// 该 operator 的前置 operator 需要将值处理为 普通类型
export const handleUndefined: () => (source: AnyObservable) => AnyObservable =
    () => (source) =>
        new Observable((observer) => {
            source.subscribe({
                next: (value) => {
                    if (isObject(value) || isArray(value)) {
                        observer.next(removeObjectOrListUndefinedValue(value));
                    } else {
                        if (!isNil(value)) {
                            observer.next(value);
                        }
                    }
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            });
        });

export const handleDistinct =
    (param: IDistinct<any, any>): ((source: AnyObservable) => AnyObservable) =>
    (source) => {
        if (typeof param === "boolean") {
            return param ? source.pipe(distinctUntilChanged()) : source;
        } else {
            return source.pipe(
                distinctUntilChanged(
                    param.comparator,
                    param.keySelector || identity
                )
            );
        }
    };

export const handleCombine =
    (
        type: CombineType,
        depends: AnyBehaviorSubject[]
    ): ((source: AnyObservable) => AnyObservable) =>
    (source) =>
        type === "self"
            ? source.pipe(withLatestFrom(...depends))
            : type === "every"
            ? source.pipe(zipWith(...depends))
            : source.pipe(combineLatestWith(...depends));

export const handleError =
    (message: string): ((source: AnyObservable) => AnyObservable) =>
    (source) =>
        source.pipe(
            catchError(() => {
                console.error(message);
                return EMPTY;
            })
        );

export const handleLogger = (
    cacheKey: string,
    name: string,
    open?: LoggerOption
): ((source: AnyObservable) => AnyObservable) =>
    open ? GlobalLoggerWatcher.get(cacheKey)!(`${name}`) : identity;
