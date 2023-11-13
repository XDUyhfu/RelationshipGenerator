import type { IConfigItem, IDistinct, ReGenConfig } from "./type";
import type { Observable, ReplaySubject } from "rxjs";
import {
    asyncScheduler,
    bufferCount,
    catchError,
    combineLatestWith,
    distinctUntilChanged,
    EMPTY,
    filter,
    identity,
    map,
    subscribeOn,
    switchMap,
    tap,
    timestamp,
    withLatestFrom,
    zipWith,
} from "rxjs";
import { compose, equals, is, isNil, not } from "ramda";
import { DefaultValue, FilterNilStage } from "./config";
import { CombineType } from "./config";
import {
    getDependNamesWithSelf,
    transformFilterNilOptionToBoolean,
    transformResultToObservable,
} from "./utils";
import { Global } from "./store";
import type { OperatorReturnType } from "./type";

const handleUndefined: (filterNil: boolean) => OperatorReturnType =
    (filterNil) => (source) =>
        filterNil ? source.pipe(filter(compose(not, isNil))) : source;

export const handleUndefinedWithStage: (
    item: IConfigItem,
    config?: ReGenConfig,
) => (stage: FilterNilStage) => OperatorReturnType =
    (item, config) => (stage) => (source) =>
        source.pipe(
            handleUndefined(
                transformFilterNilOptionToBoolean(
                    stage,
                    item.filterNil ?? config?.filterNil,
                ),
            ),
        );

export const handleDistinct =
    (
        distinct: IDistinct<any, any>,
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
                    distinct.keySelector || identity,
                ),
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
    (type: CombineType, depends: ReplaySubject<any>[]): OperatorReturnType =>
    (source) =>
        depends.length > 0
            ? type === CombineType.SELF_CHANGE
                ? source.pipe(withLatestFrom(...depends))
                : type === CombineType.EVERY_CHANGE
                ? source.pipe(zipWith(...depends))
                : source.pipe(combineLatestWith(...depends))
            : source;

export const handleDependValueChange =
    (CacheKey: string, item: IConfigItem): OperatorReturnType =>
    (source) => {
        const atom = Global.Store.get(CacheKey)!.get(item.name)!;
        return atom.replay$
            ? source.pipe(
                  // 将新的值传入buffer
                  tap((combineValue) => atom.replay$!.next(combineValue)),
                  zipWith(atom.replay$!.pipe(bufferCount(2, 1))),
                  map(([current, beforeAndCurrent]) => {
                      const isChange: Record<string, boolean> = {};
                      getDependNamesWithSelf(item).forEach((name, index) => {
                          isChange[name] = not(
                              beforeAndCurrent?.[0]?.[index]?.timestamp
                                  ? equals(
                                        beforeAndCurrent?.[0]?.[index]
                                            ?.timestamp,
                                        beforeAndCurrent?.[1]?.[index]
                                            ?.timestamp,
                                    )
                                  : equals(
                                        beforeAndCurrent?.[0]?.[index] ?? null,
                                        beforeAndCurrent?.[1]?.[index] ?? null,
                                    ),
                          );
                      });
                      return [current, isChange, beforeAndCurrent];
                  }),
              )
            : source;
    };

export const handleError =
    (message: string): OperatorReturnType =>
    (source) =>
        source.pipe(
            catchError((e) => {
                console.error(message, e);
                return EMPTY;
            }),
        );

export const WithTimestamp =
    (withTimestamp?: boolean): OperatorReturnType =>
    (source) =>
        withTimestamp ? source.pipe(timestamp()) : source;

/**
 * 不同阶段读取的 project 函数
 * @param item
 * @param stage
 */
const getProjectWithStage = (item: IConfigItem, stage: FilterNilStage) =>
    ({
        [FilterNilStage.InBefore]: identity,
        [FilterNilStage.In]: item?.interceptor?.before || identity,
        [FilterNilStage.HandleAfter]: item.handle || identity,
        [FilterNilStage.DependBefore]: identity,
        [FilterNilStage.DependAfter]: (
            value: [any, Record<string, boolean>, [any, any]],
        ) =>
            // current isChange beforeAndCurrent
            item?.depend?.handle?.(...value) ?? identity(value),
        [FilterNilStage.OutAfter]: item?.interceptor?.after || identity,
        [FilterNilStage.Out]: identity,
        [FilterNilStage.All]: identity,
        [FilterNilStage.Default]: identity,
    })[stage] as (...args: any[]) => any;

/**
 * 不同阶段的错误信息
 * @param name
 * @param stage
 * @constructor
 */
const ErrorMessage = (name: string, stage: FilterNilStage) =>
    ({
        [FilterNilStage.InBefore]: "",
        [FilterNilStage.In]: `捕获到 ${name} item.interceptor.before 中报错`,
        [FilterNilStage.HandleAfter]: `捕获到 ${name} handle 中报错`,
        [FilterNilStage.DependBefore]: "",
        [FilterNilStage.DependAfter]: `捕获到 ${name} depend.handle 中报错`,
        [FilterNilStage.OutAfter]: "",
        [FilterNilStage.Out]: `捕获到 ${name} reduce 中报错`,
        [FilterNilStage.All]: "",
        [FilterNilStage.Default]: "",
    })[stage];

export const handleTransformValue =
    (item: IConfigItem, config?: ReGenConfig) =>
    (stage: FilterNilStage): OperatorReturnType =>
    (source) =>
        getProjectWithStage(item, stage)
            ? source.pipe(
                  // 首先需要将传入的值转换成能够处理的类型 -- 主要考虑对初始值的转化
                  switchMap(transformResultToObservable),
                  // project
                  map(getProjectWithStage(item, stage)),
                  // 捕获错误
                  handleError(ErrorMessage(item.name, stage)),
                  // 处理空值
                  handleUndefinedWithStage(item, config)(stage),
                  // 最后将值转化成之后能处理的类型
                  switchMap(transformResultToObservable),
              )
            : source;

export const handleAsyncSubscribe =
    (config?: ReGenConfig): OperatorReturnType =>
    (source) =>
        config?.async ?? DefaultValue.AsyncSubscribe
            ? source.pipe(subscribeOn(asyncScheduler))
            : source;
