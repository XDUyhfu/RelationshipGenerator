import {
    AnyBehaviorSubject,
    AnyObservable,
    IDistinct,
} from "./type";
import {
    catchError,
    combineLatestWith,
    distinctUntilChanged,
    EMPTY,
    filter,
    identity,
    withLatestFrom,
    zipWith,
} from "rxjs";
import {
    equals,
    is
} from "ramda";
import { GlobalLoggerWatcher } from "./Atom";
import { CombineType } from "./config";

export const handleUndefined: (
    filterNil: boolean
) => (source: AnyObservable) => AnyObservable = (filterNil) => (source) =>
    filterNil ? source.pipe(filter(Boolean)) : source;

export const handleDistinct =
    (
        distinct: IDistinct<any, any>
    ): ((source: AnyObservable) => AnyObservable) =>
    (source) => {
        if (is(Boolean, distinct)) {
            return distinct
                ? source.pipe(distinctUntilChanged(equals))
                : source;
        } else if (distinct) {
            return source.pipe(
                distinctUntilChanged(
                    distinct.comparator,
                    distinct.keySelector || identity
                )
            );
        } else {
            return source;
        }
    };

/**
 * 支持三种合并策略: withLatestFrom combineLatestWith zipWith
 * - 默认策略为 combineLatestWith
 * @param type
 * @param depends
 */
export const handleCombine =
    (
        type: CombineType,
        depends: AnyBehaviorSubject[]
    ): ((source: AnyObservable) => AnyObservable) =>
    (source) =>
        depends.length > 0
            ? type === CombineType.SELF_CHANGE
                ? source.pipe(withLatestFrom(...depends))
                : type === CombineType.EVERY_CHANGE
                ? source.pipe(zipWith(...depends))
                : source.pipe(combineLatestWith(...depends))
            : source;

export const handleError =
    (message: string): ((source: AnyObservable) => AnyObservable) =>
    (source) =>
        source.pipe(
            catchError((e) => {
                console.error(message, e);
                return EMPTY;
            })
        );

export const handleLogger = (
    cacheKey: string,
    name: string,
    open?: { duration?: number } | boolean | number
): ((source: AnyObservable) => AnyObservable) =>
    open ? GlobalLoggerWatcher.get(cacheKey)!(`${name}`) : identity;
