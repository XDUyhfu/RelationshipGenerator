import {
    BehaviorSubject,
    Observable,
    OperatorFunction,
    ReplaySubject,
} from "rxjs";

import { AnyBehaviorSubject } from "./type";

/**
 * 一个配置项会生成一个AtomState
 * 通过 in$ 对数据进行修改
 * in$ 和 out$ 之间可以插入 map 等逻辑
 * 可以监听 out$ 得到变换后的数据
 */

export class AtomState<T = any> {
    in$: BehaviorSubject<T>;
    mid$: ReplaySubject<T>;
    out$: BehaviorSubject<T>;

    constructor(init: T) {
        this.in$ = new BehaviorSubject(init);
        this.mid$ = new ReplaySubject(0);
        this.out$ = new BehaviorSubject(init);
    }
}

export const GlobalStore = new Map<string, Map<string, AtomState>>();
export const GlobalLoggerWatcher = new Map<
    string,
    <T>(
        marbleName: string,
        selector?: ((value: T) => any) | undefined
    ) => OperatorFunction<T, T>
>();

export const AtomInOut =
    (cacheKey: string) =>
    <T = any>(name: string) => {
        const atom = GlobalStore.get(cacheKey)!.get(name)!;
        if (!atom) {
            throw new Error("用于构建的配置列表中不包含该 key 值");
        }
        return {
            [`${name}In$`]: atom.in$,
            [`${name}Out$`]: atom.out$,
        } as {
            [x: `${string}In$`]: BehaviorSubject<T>;
            [x: `${string}Out$`]: Observable<T>;
        };
    };

export const GetAtomValues = (cacheKey: string): Record<string, any> => {
    const observables = GetAtomObservables(cacheKey);
    const result = {} as Record<string, any>;
    Object.keys(observables).forEach((key) => {
        result[key] = observables[key].getValue();
    });
    return result;
};
export const GetAtomObservables = (
    cacheKey: string
): Record<string, AnyBehaviorSubject> => {
    const result = {} as Record<string, AnyBehaviorSubject>;
    if (GlobalStore.has(cacheKey)) {
        const entries = GlobalStore.get(cacheKey)!.entries();
        for (const [key, value] of entries) {
            result[key] = value.out$;
        }
    }
    return result;
};
