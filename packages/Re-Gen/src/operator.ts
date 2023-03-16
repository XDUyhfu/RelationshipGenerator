import {
    AnyBehaviorSubject,
    AnyObservable,
    CombineType,
    IDistinct,
    LoggerOption,
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
import { equals } from "ramda";
import { GlobalLoggerWatcher } from "./Atom";

export const handleUndefined: (
    open: boolean
) => (source: AnyObservable) => AnyObservable = (open) => (source) =>
    open ? source.pipe(filter(Boolean)) : source;

export const handleDistinct =
    (param: IDistinct<any, any>): ((source: AnyObservable) => AnyObservable) =>
    (source) => {
        if (typeof param === "boolean") {
            return param ? source.pipe(distinctUntilChanged(equals)) : source;
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
        depends.length > 0
            ? type === "self"
                ? source.pipe(withLatestFrom(...depends))
                : type === "every"
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
    open?: LoggerOption
): ((source: AnyObservable) => AnyObservable) =>
    open ? GlobalLoggerWatcher.get(cacheKey)!(`${name}`) : identity;
