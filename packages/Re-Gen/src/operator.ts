import { IConfigItem, IDistinct, ReGenConfig } from "./type";
import {
    BehaviorSubject,
    bufferCount,
    catchError,
    combineLatestWith,
    distinctUntilChanged,
    EMPTY,
    filter,
    identity,
    map,
    Observable,
    ReplaySubject,
    tap,
    withLatestFrom,
    zipWith,
} from "rxjs";
import { compose, equals, is, isNil, not } from "ramda";
import { CombineType, FilterNilStage } from "./config";
import { transformFilterNilOptionToBoolean } from "./utils";
import { Global } from "./store";

const handleUndefined: (
    filterNil: boolean
) => (source: Observable<any>) => Observable<any> = (filterNil) => (source) =>
    filterNil ? source.pipe(filter(compose(not, isNil))) : source;

export const handleUndefinedWithStage: (
    item: IConfigItem,
    config?: ReGenConfig
) => (stage: FilterNilStage) => (source: Observable<any>) => Observable<any> =
    (item, config) => (stage) => (source) =>
        source.pipe(
            handleUndefined(
                transformFilterNilOptionToBoolean(
                    stage,
                    item.filterNil ?? config?.filterNil
                )
            )
        );

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

const handleCombineWithBuffer =
    (
        CacheKey: string,
        name: string,
        dependNamesWithSelf: string[]
    ): ((source: Observable<any>) => Observable<any>) =>
    (source) =>
        Global.Buffer.get(CacheKey)!.has(name)
            ? source.pipe(
                  tap((combineValue) =>
                      Global.Buffer.get(CacheKey)!.get(name)!.next(combineValue)
                  ),
                  zipWith(
                      Global.Buffer.get(CacheKey)!
                          .get(name)!
                          .pipe(bufferCount(2, 1))
                  ),
                  map(([current, beforeAndCurrent]) => {
                      const isChange: Record<string, boolean> = {};
                      dependNamesWithSelf?.forEach((name, index) => {
                          isChange[name] = not(
                              equals(
                                  beforeAndCurrent?.[0]?.[index],
                                  beforeAndCurrent?.[1]?.[index]
                              )
                          );
                      });
                      return [current, isChange, beforeAndCurrent];
                  })
              )
            : source;

export const handleDependValueChange = (
    CacheKey: string,
    item: IConfigItem,
    dependsName: string[]
) => {
    // 使用额外的 BehaviorSubject 存储数据进行判断
    if (item.depend) {
        if (!Global.Buffer.get(CacheKey)!.has(item.name)) {
            const replay = new ReplaySubject<any[]>(2);
            Global.Buffer.get(CacheKey)!.set(item.name, replay);
            // 存储一个初始值 [] 作为初始值
            replay.next([]);
        }
    }
    return handleCombineWithBuffer(CacheKey, item.name, [
        item.name,
        ...dependsName,
    ]);
};

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
