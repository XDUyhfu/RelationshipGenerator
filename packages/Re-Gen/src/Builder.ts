import { identity, of, map, switchMap, scan } from "rxjs";
import { AtomInOut, AtomState, GlobalStore, GlobalLoggerWatcher } from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    handleDistinct,
    handleResult,
    handleCombine,
    handleError,
    handleLogger,
    handleUndefined,
    transformFilterNilOptionToBoolean,
    transformDistinctOptionToBoolean,
} from "./utils";
import type { IConfigItem } from "./type";
import { lt, cond, equals, forEach } from "ramda";
import { ReGenOptions } from "./type";
import { getGroup } from "rxjs-watcher";
import {
    CombineTypeDefaultValue,
    NilOptionDefaultValue,
    RxjsWaterDurationDefaultValue,
} from "./config";

const ConfigToAtomStore =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            cond([
                [
                    equals(false),
                    () => {
                        GlobalStore.get(cacheKey)!.set(
                            item.name,
                            new AtomState(item.init)
                        );
                        if (
                            !GlobalLoggerWatcher.has(cacheKey) &&
                            !!_options?.logger
                        ) {
                            GlobalLoggerWatcher.set(
                                cacheKey,
                                getGroup(
                                    `${cacheKey} watcher group`,
                                    typeof _options?.logger === "boolean"
                                        ? RxjsWaterDurationDefaultValue
                                        : _options.logger?.duration
                                )
                            );
                        }
                    },
                ],
                [
                    equals(true),
                    () => {
                        throw Error("配置项中 name 字段重复");
                    },
                ],
            ])(GlobalStore.get(cacheKey)!.has(item.name));
        })(RelationConfig);

// 处理自身的 handler
const AtomHandle =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = GlobalStore.get(cacheKey)!.get(item.name)!;
            atom.in$
                .pipe(
                    switchMap(handleResult),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "In",
                            item.filterNil
                                ? true
                                : _options?.filterNil ?? NilOptionDefaultValue
                        )
                    ),
                    map(item.handle || identity),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "HandleAfter",
                            item.filterNil
                                ? true
                                : _options?.filterNil ?? NilOptionDefaultValue
                        )
                    ),
                    switchMap(handleResult),
                    handleError(`捕获到 ${item.name} handle 中报错`)
                )
                .subscribe(atom.mid$);
        })(RelationConfig);

const HandDepend =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = GlobalStore.get(cacheKey)!.get(item.name)!;
            const dependNames = getDependNames(item);
            const dependAtomsOut$ = dependNames.map((name) => {
                if (
                    GlobalStore.get(cacheKey)!.has(name) &&
                    item.name !== name
                ) {
                    return GlobalStore.get(cacheKey)!.get(name)!.out$;
                } else {
                    if (item.name === name) {
                        throw Error(`${item.name} 依赖了自己`);
                    }
                    throw Error(`${item.name} 的依赖项 ${name} 不存在`);
                }
            });

            cond([
                [
                    lt(0),
                    () =>
                        atom.mid$
                            .pipe(
                                switchMap(handleResult),
                                handleCombine(
                                    item.depend?.combineType ||
                                        CombineTypeDefaultValue,
                                    dependAtomsOut$
                                ),
                                map(item.depend?.handle || identity),
                                switchMap(handleResult),
                                handleUndefined(
                                    transformFilterNilOptionToBoolean(
                                        "DependAfter",
                                        item.filterNil
                                            ? true
                                            : _options?.filterNil ??
                                                  NilOptionDefaultValue
                                    )
                                ),
                                handleError(
                                    `捕获到 ${item.name} depend.handle 中报错`
                                ),
                                scan(
                                    item?.reduce?.handle ||
                                        defaultReduceFunction,
                                    item.reduce?.init
                                ),
                                handleUndefined(
                                    transformFilterNilOptionToBoolean(
                                        "ScanAfter",
                                        item.filterNil
                                            ? true
                                            : _options?.filterNil ??
                                                  NilOptionDefaultValue
                                    )
                                ),
                                switchMap(handleResult),
                                handleError(`捕获到 ${item.name} scan 中报错`),
                                handleDistinct(
                                    transformDistinctOptionToBoolean(
                                        _options?.distinct,
                                        item.distinct
                                    )
                                ),
                                handleLogger(
                                    cacheKey,
                                    item.name,
                                    _options?.logger
                                )
                            )
                            .subscribe(atom.out$),
                ],
                [
                    equals(0),
                    () =>
                        atom.mid$
                            .pipe(
                                switchMap(handleResult),
                                scan(
                                    item?.reduce?.handle ||
                                        defaultReduceFunction,
                                    item.reduce?.init
                                ),
                                handleUndefined(
                                    transformFilterNilOptionToBoolean(
                                        "ScanAfter",
                                        item.filterNil
                                            ? true
                                            : _options?.filterNil ??
                                                  NilOptionDefaultValue
                                    )
                                ),
                                switchMap(handleResult),
                                handleDistinct(
                                    transformDistinctOptionToBoolean(
                                        _options?.distinct,
                                        item.distinct
                                    )
                                ),
                                handleError(`捕获到 ${item.name} scan 中报错`),
                                handleLogger(
                                    cacheKey,
                                    item.name,
                                    _options?.logger
                                )
                            )
                            .subscribe(atom.out$),
                ],
            ])(dependNames.length);
        })(RelationConfig);

const BuilderRelation = (
    cacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenOptions
) =>
    of<IConfigItem[]>(RelationConfig).pipe(
        map(ConfigToAtomStore(cacheKey, options)),
        map(AtomHandle(cacheKey, options)),
        map(HandDepend(cacheKey, options))
    );

export const ReGen = (
    cacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenOptions
) => {
    GlobalStore.set(cacheKey, new Map<string, AtomState>());
    BuilderRelation(cacheKey, RelationConfig, options).subscribe();
    return AtomInOut(cacheKey);
};
