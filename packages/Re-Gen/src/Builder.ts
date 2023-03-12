import { identity, of, map, switchMap, scan } from "rxjs";
import { AtomInOut, AtomState, GlobalStore } from "./Atom";
import {
    defaultReduceFunction,
    getDependNames,
    handleDistinct,
    handleObservable,
    handlePromise,
    handleResult,
    handleCombine,
    handleUndefined,
    handleError,
} from "./utils";
import type { IConfigItem } from "./type";
import { lt, cond, equals, forEach } from "ramda";
import { ReGenOptions } from "./type";

// 因为配置项的顺序可能在依赖项的前边，所以先将所有的单状态进行存储，然后再处理依赖关系
const ConfigToAtomStore =
    (cacheKey: string, _options?: ReGenOptions) =>
    (RelationConfig: IConfigItem[]) =>
        forEach((item: IConfigItem) => {
            cond([
                [
                    equals(false),
                    () =>
                        GlobalStore.get(cacheKey)!.set(
                            item.name,
                            new AtomState(item.init)
                        ),
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
                    // 执行 handle
                    handlePromise(),
                    handleObservable(),
                    map(item.handle || identity), // 处理 result 为 ObservableInput
                    // 使用 switchMap 的原因是因为一个 Observable 中可能会产生多个值，此时需要将之前的取消并切换为新值
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
            const dependAtomsIn$ = dependNames.map(
                (name) => GlobalStore.get(cacheKey)!.get(name)!.out$
            );

            cond([
                [
                    lt(0),
                    () =>
                        atom.mid$
                            .pipe(
                                handleCombine(
                                    item.depend?.combineType || "any",
                                    dependAtomsIn$
                                ),
                                map(item.depend?.handle || identity),
                                handleError(
                                    `捕获到 ${item.name} depend.handle 中报错`
                                ),
                                scan(
                                    item?.reduce || defaultReduceFunction,
                                    item.init
                                ),
                                switchMap(handleResult),
                                handleDistinct(item.distinct ?? true),
                                handleError(
                                    `捕获到 ${item.name} depend.scan 中报错`
                                )
                            )
                            .subscribe(atom.out$),
                ],
                [
                    equals(0),
                    () =>
                        atom.mid$
                            .pipe(
                                scan(
                                    item?.reduce || defaultReduceFunction,
                                    item.init
                                ),
                                handleUndefined(),
                                handleDistinct(item.distinct ?? true),
                                handleError("error")
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
