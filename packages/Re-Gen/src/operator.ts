import { IDistinct } from "./type";
import {
    BehaviorSubject,
    catchError,
    combineLatestWith,
    distinctUntilChanged,
    EMPTY,
    filter,
    identity,
    Observable,
    withLatestFrom,
    zipWith,
} from "rxjs";
import {
    equals,
    is
} from "ramda";
import { CombineType } from "./config";
import { Global } from "./store";

export const handleUndefined: (
    filterNil: boolean
) => (source: Observable<any>) => Observable<any> = (filterNil) => (source) =>
    filterNil ? source.pipe(filter(Boolean)) : source;

export const handleDistinct =
    (
        distinct: IDistinct<any, any>
    ): ((source: Observable<any>) => Observable<any>) =>
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
        depends: BehaviorSubject<any>[]
    ): ((source: Observable<any>) => Observable<any>) =>
    (source) =>
        depends.length > 0
            ? type === CombineType.SELF_CHANGE
                ? source.pipe(withLatestFrom(...depends))
                : type === CombineType.EVERY_CHANGE
                    ? source.pipe(zipWith(...depends))
                    : source.pipe(combineLatestWith(...depends))
            : source;


export const handleError =
    (message: string): ((source: Observable<any>) => Observable<any>) =>
    (source) =>
        source.pipe(
            catchError((e) => {
                console.error(message, e);
                return EMPTY;
            })
        );

export const handleLogger = (
    CacheKey: string,
    name: string,
    open?: { duration?: number } | boolean | number
): ((source: Observable<any>) => Observable<any>) =>
    open ? Global.LoggerWatcher.get(CacheKey)!(`${name}`) : identity;
