import {
    Observable,
    isObservable,
    of,
    distinctUntilChanged,
    identity,
    BehaviorSubject,
    combineLatestWith,
    withLatestFrom,
} from "rxjs";
import { IConfigItem, IDistinct, PlainResult, ReturnResult } from "../type";
import { filter, isNil, not, compose } from "ramda";
import { CombineEnum } from "../config";

export const getDependNames = (item: IConfigItem) => item.depend?.names || [];
export const defaultReduceFunction = (_: any, val: any) => val;

const removeObjectOrListUndefinedValue = filter(compose(not, isNil));

const isPromise = (value: any): value is Promise<any> =>
    value instanceof Promise;

const isArray = (value: any): value is Array<any> => Array.isArray(value);
const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value); // Observable 也是一个 Object 类型
const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isObject(result) ||
    Array.isArray(result) ||
    result === null;

export const handleResult = (result: ReturnResult) =>
    isPlainResult(result) ? of(result) : result;

export function handleObservable(): (
    source: Observable<any>
) => Observable<any> {
    return (source: Observable<any>): Observable<any> =>
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
}

export function handlePromise<T>(): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>): Observable<T> =>
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
}

// 该 operator 的前置 operator 需要将值处理为 普通类型
export function handleUndefined(): (
    source: Observable<any>
) => Observable<any> {
    return (source: Observable<any>): Observable<any> =>
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
}

export function handleDistinct(
    param: IDistinct<any, any>
): (source: Observable<any>) => Observable<any> {
    return (source: Observable<any>): Observable<any> => {
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
}

export function handleCombine(
    type: CombineEnum,
    depends: BehaviorSubject<any>[]
): (source: Observable<any>) => Observable<any> {
    return (source: Observable<any>): Observable<any> =>
        type === CombineEnum.SELF
            ? source.pipe(withLatestFrom(...depends))
            : source.pipe(combineLatestWith(...depends));
}
