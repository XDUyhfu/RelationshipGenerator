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
    AnyBehaviorSubject,
    AnyObservable,
    CombineType,
    IConfigItem,
    IDistinct,
    LoggerOption,
    ReturnResult,
} from "../type";
import { filter, isNil, not, compose } from "ramda";
import { GlobalLoggerWatcher } from "../Atom";
import {
    isArray,
    isObject,
    isPlainResult,
    isPromise,
} from "@yhfu/re-gen-utils";

export const getDependNames = (item: IConfigItem) => item.depend?.names || [];
export const defaultReduceFunction = (_: any, val: any) => val;

const removeObjectOrListUndefinedValue = filter(compose(not, isNil));

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
