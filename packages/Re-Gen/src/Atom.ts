import { BehaviorSubject, ReplaySubject } from "rxjs";
import type { IConfigItem } from "./type";
import { Global } from "./store";
import { isNil } from "ramda";

export class AtomState {
    in$: ReplaySubject<any>;
    mid$: ReplaySubject<any>;
    out$: ReplaySubject<any>;

    replay$: ReplaySubject<any[]> | null = null;
    destroy$: ReplaySubject<any>;

    constructor(CacheKey: string, item: IConfigItem) {
        this.in$ = new ReplaySubject(0);
        this.mid$ = new ReplaySubject(0);
        this.out$ = new ReplaySubject(0);

        // 销毁时使用的
        this.destroy$ = new ReplaySubject(0);
        // if (!Global.OutBridge.has(CacheKey)) {
        //     Global.OutBridge.set(CacheKey, new Map());
        // }
        // if (!Global.InBridge.has(CacheKey)) {
        //     Global.InBridge.set(CacheKey, new Map());
        // }
        if (!Global.OutBridge.get(CacheKey)!.has(item.name)) {
            Global.OutBridge.get(CacheKey)!.set(
                item.name,
                new BehaviorSubject(null),
            );
        }
        if (!Global.InBridge.get(CacheKey)!.has(item.name)) {
            Global.InBridge.get(CacheKey)!.set(item.name, new ReplaySubject(0));
        }

        // 如果有依赖的话，记录变化前后的数据
        if (item.depend) {
            this.replay$ = new ReplaySubject<any[]>(2);
            this.replay$.next([]);
        }
    }

    destroy() {
        this.destroy$?.next({});
        this.in$.complete();
        this.mid$.complete();
        this.out$.complete();
        this.replay$?.complete();
        this.destroy$.complete();
    }
}

/**
 * 通过判断 RelationConfig 是否有效，返回不同的处理函数
 * 主要是考虑到配置文件异步加载的情况，可能会导致后续的操作报错的问题
 * @param CacheKey
 * @constructor
 */
export const AtomInOut = (CacheKey: string) => (name: string) => {
    if (!Global.OutBridge.get(CacheKey)!.has(name)) {
        Global.OutBridge.get(CacheKey)!.set(name, new BehaviorSubject(null));
    }
    if (!Global.InBridge.get(CacheKey)!.has(name)) {
        Global.InBridge.get(CacheKey)!.set(name, new ReplaySubject(0));
    }

    return {
        [`${name}Out$`]: Global.OutBridge.get(CacheKey)!.get(name),
        [`${name}In$`]: Global.InBridge.get(CacheKey)!.get(name),
    } as {
        [x: `${string}Out$`]: BehaviorSubject<any>;
        [y: `${string}In$`]: ReplaySubject<any>;
    };
};

const GetCurrentAtomValues = (CacheKey: string): Record<string, any> => {
    const observables = GetAtomOutObservables(CacheKey);
    const result = {} as Record<string, any>;
    const entries = observables?.entries() ?? new Map().entries();
    for (const [key, value] of entries) {
        result[key] = value.getValue();
    }
    return result;
};

const GetCurrentAtomValueByName = (CacheKey: string, name: string) =>
    GetCurrentAtomValues(CacheKey)[name];

const GetAtomOutObservables = (
    CacheKey: string,
): Map<string, BehaviorSubject<any>> | undefined =>
    Global.OutBridge.get(CacheKey);

const GetAtomOutObservableByName = (
    CacheKey: string,
    name: string,
): BehaviorSubject<any> | undefined =>
    GetAtomOutObservables(CacheKey)?.get(name);

const GetAtomInObservables = (
    CacheKey: string,
): Map<string, ReplaySubject<any>> =>
    Global.InBridge.get(CacheKey) ?? new Map();

const GetAtomInObservableByName = (CacheKey: string, name: string) =>
    GetAtomInObservables(CacheKey).get(name);

const SetAtomValueByName = (CacheKey: string) => (name: string, value: any) =>
    GetAtomInObservables(CacheKey)?.get(name)?.next(value);

export function getValue(CacheKey: string): Record<string, any>;
export function getValue(CacheKey: string, name?: string): any;
export function getValue(CacheKey: string, name?: string) {
    if (name) {
        return GetCurrentAtomValueByName(CacheKey, name);
    }
    return GetCurrentAtomValues(CacheKey);
}

export function getOutObservable(
    CacheKey: string,
): Map<string, BehaviorSubject<any>>;
export function getOutObservable(
    CacheKey: string,
    name?: string,
): BehaviorSubject<any>;
export function getOutObservable(CacheKey: string, name?: string) {
    if (name) {
        return GetAtomOutObservableByName(CacheKey, name);
    }
    return GetAtomOutObservables(CacheKey);
}

export function getInObservable(
    CacheKey: string,
): Map<string, ReplaySubject<any>>;
export function getInObservable(
    CacheKey: string,
    name?: string,
): ReplaySubject<any>;
export function getInObservable(CacheKey: string, name?: string) {
    if (name) {
        return GetAtomInObservableByName(CacheKey, name);
    }
    return GetAtomInObservables(CacheKey);
}

export function setValue(CacheKey: string, name: string): (value: any) => void;
export function setValue(CacheKey: string, name: string, value?: any): void;
export function setValue(CacheKey: string, name: string, value?: any) {
    if (!isNil(value)) {
        SetAtomValueByName(CacheKey)(name, value);
        return;
    }
    return (value: any) => {
        SetAtomValueByName(CacheKey)(name, value);
    };
}
