import { identity, of, map, switchMap, scan } from "rxjs";
import { AtomInOut, AtomState, GlobalConfig, GlobalStore } from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    transformResultToObservable,
    transformFilterNilOptionToBoolean,
    transformDistinctOptionToBoolean,
    JudgeRepetition,
    DependencyDetection,
    OpenLogger,
    PluckValue,
    CheckReGenParams,
} from "./utils";
import type { IConfigItem } from "./type";
import { forEach } from "ramda";
import { ReGenOptions } from "./type";

import { CombineTypeDefaultValue, FilterNilOptionDefaultValue } from "./config";
import {
    handleCombine,
    handleDistinct,
    handleError,
    handleLogger,
    handleUndefined,
} from "./operator";

const ConfigToAtomStore =
    (cacheKey: string) => (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            GlobalStore.get(cacheKey)!.set(
                item.name,
                new AtomState(
                    typeof item.init === "function" ? item.init() : item.init
                )
            );
        })(RelationConfig);

// 处理自身的 handler
const AtomHandle =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = GlobalStore.get(cacheKey)!.get(item.name)!;
            atom.in$
                .pipe(
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "In",
                            item.filterNil ??
                                _options?.filterNil ??
                                FilterNilOptionDefaultValue
                        )
                    ),
                    map(item.handle || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "HandleAfter",
                            item.filterNil ??
                                _options?.filterNil ??
                                FilterNilOptionDefaultValue
                        )
                    ),
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
            const dependAtomsOut$ = dependNames.map(
                (name) => GlobalStore.get(cacheKey)!.get(name)!.out$
            );
            atom.mid$
                .pipe(
                    switchMap(transformResultToObservable),
                    handleCombine(
                        item.depend?.combineType || CombineTypeDefaultValue,
                        dependAtomsOut$
                    ),
                    map(item?.depend?.handle || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "DependAfter",
                            item.filterNil ??
                                _options?.filterNil ??
                                FilterNilOptionDefaultValue
                        )
                    ),
                    handleError(`捕获到 ${item.name} depend.handle 中报错`),
                    scan(
                        item?.reduce?.handle || defaultReduceFunction,
                        item.reduce?.init
                    ),
                    switchMap(transformResultToObservable),
                    handleError(`捕获到 ${item.name} reduce 中报错`),
                    handleDistinct(
                        transformDistinctOptionToBoolean(
                            _options?.distinct,
                            item.distinct
                        )
                    ),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "Out",
                            item.filterNil ??
                                _options?.filterNil ??
                                FilterNilOptionDefaultValue
                        )
                    ),
                    handleLogger(cacheKey, item.name, _options?.logger)
                )
                .subscribe(atom.out$);
        })(RelationConfig);

const BuilderRelation = (
    cacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenOptions
) =>
    of<IConfigItem[]>(RelationConfig).pipe(
        map(OpenLogger(cacheKey, options)),
        map(JudgeRepetition()),
        map(DependencyDetection()),
        map(ConfigToAtomStore(cacheKey)),
        map(AtomHandle(cacheKey, options)),
        map(HandDepend(cacheKey, options))
    );

export const ReGen = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenOptions
) => {

    CheckReGenParams(CacheKey, RelationConfig);

    if (!GlobalStore.has(CacheKey)) {
        GlobalStore.set(CacheKey, new Map<string, AtomState>());
        GlobalConfig.set(CacheKey, PluckValue(RelationConfig));
        BuilderRelation(CacheKey, RelationConfig, options).subscribe();
    }
    return AtomInOut(CacheKey);
};
