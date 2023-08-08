import {
    identity,
    of,
    map,
    switchMap,
    scan,
    filter,
    BehaviorSubject,
    ReplaySubject,
} from "rxjs";
import { AtomInOut, AtomState, getOutObservable } from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    transformResultToObservable,
    transformDistinctOptionToBoolean,
    OpenLogger,
    PluckValue,
    CheckParams,
    isJointAtom,
    generateOneDimensionRelationConfig,
} from "./utils";
import type { IConfigItem } from "./type";
import { forEach } from "ramda";
import { IAtomInOut, IRelationConfig, ReGenConfig } from "./type";

import { CombineType, FilterNilStage, ReGenPrefix } from "./config";
import {
    handleCombine,
    handleCombineWithBuffer,
    handleDistinct,
    handleError,
    handleLogger,
    handleUndefinedWithStage,
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
            const jointName = `${ReGenPrefix}:${CacheKey}:${item.name}`;
            let initValue = item.init;
            if (typeof item.init === "function") {
                initValue = item.init();
            }
            const joint = isJointAtom(item.init);
            let observable = joint
                ? getOutObservable(joint[0])[joint[1]]
                : null;
            if (!observable && Array.isArray(joint)) {
                observable = new BehaviorSubject(null);
                if (Global.AtomBridge.has(item.init as string)) {
                    Global.AtomBridge.set(item.init as string, [
                        ...Global.AtomBridge.get(item.init as string)!,
                        observable,
                    ]);
                } else {
                    Global.AtomBridge.set(item.init as string, [observable]);
                }
            }
            const atom = new AtomState(joint ? observable : initValue);
            if (Global.AtomBridge.has(jointName)) {
                Global.AtomBridge.get(jointName)!.forEach((observable) =>
                    atom.out$.subscribe(observable)
                );
            }
            Global.Store.get(CacheKey)!.set(item.name, atom);
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
            const handleUndefined = handleUndefinedWithStage(item, config);
            atom.in$
                .pipe(
                    filter((item) => !isJointAtom(item)),
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.InBefore),
                    map(item?.interceptor?.before || identity),
                    handleError(
                        `捕获到 ${item.name} item.interceptor.before 中报错`
                    ),
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.In),
                    switchMap(transformResultToObservable),
                    map(item.handle || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.HandleAfter),
                    handleError(`捕获到 ${item.name} handle 中报错`)
                )
                .subscribe(atom.mid$);
        })(RelationConfig);

/**
 * 处理当前状态及其依赖状态, 当依赖状态值发生变化的时候，会根据相关策略进行计算新的状态值
 * @param CacheKey
 * @param config
 * @constructor
 */
const HandleDepend =
    (CacheKey: string, config?: ReGenConfig) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            const atom = Global.Store.get(CacheKey)!.get(item.name)!;
            const dependNames = getDependNames(item);
            const handleUndefined = handleUndefinedWithStage(item, config);
            const dependAtomsOut$ = dependNames.map(
                (name) => Global.Store.get(CacheKey)!.get(name)!.out$
            );

            // 使用额外的 BehaviorSubject 存储数据进行判断
            if (item.depend) {
                if (!Global.Buffer.get(CacheKey)!.has(item.name)) {
                    const replay = new ReplaySubject<any[]>(2);
                    Global.Buffer.get(CacheKey)!.set(item.name, replay);
                    // 存储一个初始值 []
                    replay.next([]);
                }
            }

            atom.mid$
                .pipe(
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.DependBefore),
                    handleCombine(
                        item.depend?.combineType || CombineType.ANY_CHANGE,
                        dependAtomsOut$
                    ),
                    handleCombineWithBuffer(CacheKey, item.name, [
                        item.name,
                        ...getDependNames(item),
                    ]),
                    map(
                        item?.depend?.handle
                            ? (value) =>
                                  item?.depend?.handle(
                                      value?.[0],
                                      value?.[1],
                                      value?.[2]
                                  )
                            : identity
                    ),
                    handleError(`捕获到 ${item.name} depend.handle 中报错`),
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.DependAfter),
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
                    handleUndefined(FilterNilStage.Out),
                    map(item?.interceptor?.after || identity),
                    switchMap(transformResultToObservable),
                    handleUndefined(FilterNilStage.OutAfter),
                    handleError(
                        `捕获到 ${item.name} item.interceptor.after 中报错`
                    ),
                    handleLogger(CacheKey, item.name, config?.logger)
                )
                .subscribe(atom.out$);
        })(RelationConfig);

const HandleInitValue =
    (CacheKey: string, config?: ReGenConfig) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            if (!config?.init) {
                return;
            }
            const initValue = config.init?.[item.name];
            if (initValue) {
                const outObservable = getOutObservable(CacheKey, item.name);
                outObservable?.next(initValue);
            }
        })(RelationConfig);

/**
 * 构建的整体流程
 * @param CacheKey
 * @param RelationConfig
 * @param config
 * @constructor
 */
const BuilderRelation = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    config?: ReGenConfig
) =>
    of(RelationConfig).pipe(
        map(ConfigToAtomStore(CacheKey)),
        map(AtomHandle(CacheKey, config)),
        map(HandleDepend(CacheKey, config)),
        map(HandleInitValue(CacheKey, config))
    );

export const ReGen = (
    CacheKey: string,
    RelationConfig: IRelationConfig,
    config?: ReGenConfig
): IAtomInOut => {
    const OneDimensionRelationConfig = generateOneDimensionRelationConfig(
        CacheKey,
        RelationConfig
    );

    CheckParams(CacheKey, OneDimensionRelationConfig, "library");
    OpenLogger(CacheKey, config);
    if (RelationConfig.length === 0) {
        return () => ({});
    }

    if (!Global.Store.has(CacheKey)) {
        Global.Store.set(CacheKey, new Map<string, AtomState>());
        Global.RelationConfig.set(
            CacheKey,
            PluckValue(OneDimensionRelationConfig)
        );
        Global.Buffer.set(CacheKey, new Map<string, ReplaySubject<any[]>>());
        BuilderRelation(
            CacheKey,
            OneDimensionRelationConfig,
            config
        ).subscribe();
    }
    return AtomInOut(CacheKey);
};
