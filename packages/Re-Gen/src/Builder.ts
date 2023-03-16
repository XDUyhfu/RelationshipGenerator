import { identity, of, map, switchMap, scan } from "rxjs";
import { AtomInOut, AtomState, GlobalStore, GlobalLoggerWatcher } from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    transformResultToObservable,
    transformFilterNilOptionToBoolean,
    transformDistinctOptionToBoolean,
    JudgeRepetition,
    DependencyDetection,
} from "./utils";
import type { IConfigItem } from "./type";
import { forEach } from "ramda";
import { ReGenOptions } from "./type";
import { getGroup } from "rxjs-watcher";
import {
    CombineTypeDefaultValue,
    RxjsWaterDurationDefaultValue,
} from "./config";
import {
    handleCombine,
    handleDistinct,
    handleError,
    handleLogger,
    handleUndefined,
} from "./operator";

const ConfigToAtomStore =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            GlobalStore.get(cacheKey)!.set(
                item.name,
                new AtomState(
                    typeof item.init === "function" ? item.init() : item.init
                )
            );
            if (!GlobalLoggerWatcher.has(cacheKey) && !!_options?.logger) {
                GlobalLoggerWatcher.set(
                    cacheKey,
                    getGroup(
                        `${cacheKey} Watcher Group`,
                        typeof _options?.logger === "boolean"
                            ? RxjsWaterDurationDefaultValue
                            : _options.logger?.duration
                    )
                );
            }
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
                            _options?.filterNil ?? "default",
                            item.filterNil
                        )
                    ),
                    map(item.handle || identity),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "HandleAfter",
                            _options?.filterNil ?? "default",
                            item.filterNil
                        )
                    ),
                    switchMap(transformResultToObservable),
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
                            _options?.filterNil ?? "default",
                            item.filterNil
                        )
                    ),
                    handleError(`捕获到 ${item.name} depend.handle 中报错`),
                    scan(
                        item?.reduce?.handle || defaultReduceFunction,
                        item.reduce?.init
                    ),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            "ReduceAfter",
                            _options?.filterNil ?? "default",
                            item.filterNil
                        )
                    ),
                    switchMap(transformResultToObservable),
                    handleError(`捕获到 ${item.name} reduce 中报错`),
                    handleDistinct(
                        transformDistinctOptionToBoolean(
                            _options?.distinct,
                            item.distinct
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
        map(JudgeRepetition()),
        map(DependencyDetection()),
        map(ConfigToAtomStore(cacheKey, options)),
        map(AtomHandle(cacheKey, options)),
        map(HandDepend(cacheKey, options))
    );

export const ReGen = (
    cacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenOptions
) => {
    if (GlobalStore.has(cacheKey)) {
        return AtomInOut(cacheKey);
    }

    GlobalStore.set(cacheKey, new Map<string, AtomState>());
    BuilderRelation(cacheKey, RelationConfig, options).subscribe();
    return AtomInOut(cacheKey);
};
