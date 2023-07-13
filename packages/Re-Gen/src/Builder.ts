import {
    identity,
    of,
    map,
    switchMap,
    scan,
    filter
} from "rxjs";
import {
    AtomInOut,
    AtomState,
    getOutObservable
} from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    transformResultToObservable,
    transformFilterNilOptionToBoolean,
    transformDistinctOptionToBoolean,
    OpenLogger,
    PluckValue,
    CheckParams,
    isJointAtom
} from "./utils";
import type { IConfigItem } from "./type";
import { forEach } from "ramda";
import { ReGenConfig } from "./type";

import {
    CombineType,
    FilterNilStage,
} from "./config";
import {
    handleCombine,
    handleDistinct,
    handleError,
    handleLogger,
    handleUndefined,
} from "./operator";
import { Global } from "./store";

/**
 * 该方法将每个配置项构建为一个 AtomState 并进行存储
 * @param CacheKey
 * @constructor
 */
const ConfigToAtomStore =
    (CacheKey: string) => (RelationConfig: IConfigItem[]) =>
        // 里面用到的 forEach 来自 ramda，它会将传入的参数返回
        forEach((item: IConfigItem) => {
            let initValue = item.init;
            if (typeof item.init === "function") { initValue = item.init(); }
            const joint = isJointAtom(item.init);
            if (joint) { initValue = getOutObservable(joint[0])[joint[1]]; }
            Global.Store.get(CacheKey)!.set( item.name, new AtomState( initValue ) );
        })(RelationConfig);

/**
 * 该过程用于执行状态自身的 handle 函数
 * @param CacheKey
 * @param config
 * @constructor
 */
const AtomHandle =
    (CacheKey: string, config?: ReGenConfig) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = Global.Store.get(CacheKey)!.get(item.name)!;
            atom.in$
                .pipe(
                    filter(item => !isJointAtom(item)),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            FilterNilStage.In,
                            item.filterNil ??
                            config?.filterNil
                        )
                    ),
                    switchMap(transformResultToObservable),
                    map(item.handle || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            FilterNilStage.HandleAfter,
                            item.filterNil ??
                            config?.filterNil
                        )
                    ),
                    handleError(`捕获到 ${item.name} handle 中报错`),

                )
                .subscribe(atom.mid$);
        })(RelationConfig);


/**
 * 处理当前状态及其依赖状态, 当依赖状态值发生变化的时候，会根据相关策略进行计算新的状态值
 * @param CacheKey
 * @param config
 * @constructor
 */
const HandDepend =
    (CacheKey: string, config?: ReGenConfig) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = Global.Store.get(CacheKey)!.get(item.name)!;
            const dependNames = getDependNames(item);
            const dependAtomsOut$ = dependNames.map(
                (name) => Global.Store.get(CacheKey)!.get(name)!.out$
            );
            atom.mid$
                .pipe(
                    switchMap(transformResultToObservable),
                    handleCombine(
                        item.depend?.combineType || CombineType.ANY_CHANGE,
                        dependAtomsOut$
                    ),
                    // TODO 需要检测是否存在依赖项，有依赖项才使用 handle 进行处理
                    map(item?.depend?.handle || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            FilterNilStage.DependAfter,
                            item.filterNil ??
                            config?.filterNil
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
                            config?.distinct,
                            item.distinct
                        )
                    ),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            FilterNilStage.Out,
                            item.filterNil ??
                            config?.filterNil
                        )
                    ),
                    map(item.interceptor || identity ),
                    switchMap(transformResultToObservable),
                    handleUndefined(
                        transformFilterNilOptionToBoolean(
                            FilterNilStage.OutBefore,
                            item.filterNil ??
                            config?.filterNil
                        )
                    ),
                    handleError(`捕获到 ${item.name} interceptor 中报错`),
                    handleLogger(CacheKey, item.name, config?.logger),
                )
                .subscribe( atom.out$ );
        })(RelationConfig);

/**
 * 构建的整体流程
 * @param CacheKey
 * @param RelationConfig
 * @param options
 * @constructor
 */
const BuilderRelation = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    options?: ReGenConfig
) =>
    of<IConfigItem[]>(RelationConfig).pipe(
        map(OpenLogger(CacheKey, options)),
        map(ConfigToAtomStore(CacheKey)),
        map(AtomHandle(CacheKey, options)),
        map(HandDepend(CacheKey, options))
    );

export const ReGen = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    config?: ReGenConfig
) => {

    CheckParams(CacheKey, RelationConfig, "library");
    if (RelationConfig.length === 0) {
        return () => ({});
    }

    if (!Global.Store.has(CacheKey)) {
        Global.Store.set(CacheKey, new Map<string, AtomState>());
        Global.RelationConfig.set(CacheKey, PluckValue(RelationConfig));
        BuilderRelation(CacheKey, RelationConfig, config).subscribe();
    }
    return AtomInOut(CacheKey);
};


