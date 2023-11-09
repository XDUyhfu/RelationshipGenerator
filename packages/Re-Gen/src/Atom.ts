import { BehaviorSubject, ReplaySubject } from "rxjs";
import type { AtomsType, IConfigItem } from "./type";
import { Global } from "./store";
import { isNil } from "ramda";
import { JointState } from "./utils";

export class AtomState {
    in$: BehaviorSubject<any>;
    mid$: ReplaySubject<any>;
    out$: BehaviorSubject<any>;

    replay$: ReplaySubject<any[]> | null = null;
    destroy$: ReplaySubject<any>;

    constructor(init: any, CacheKey: string, item: IConfigItem) {
        this.in$ = new BehaviorSubject(init);
        this.mid$ = new ReplaySubject(0);
        this.out$ = new BehaviorSubject(null);

        // 销毁时使用的
        this.destroy$ = new ReplaySubject(0);

        const JointName = JointState(CacheKey, item.name);
        if (!Global.OutBridge.has(JointName)) {
            Global.OutBridge.set(JointName, new ReplaySubject(0));
        }
        if (!Global.InBridge.has(JointName)) {
            Global.InBridge.set(JointName, new ReplaySubject());
        }
        this.out$.subscribe(Global.OutBridge.get(JointName)!);
        Global.OutBridge.get(JointName)!.subscribe(this.in$);

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
    const JointName = JointState(CacheKey, name);
    if (!Global.OutBridge.has(JointName)) {
        Global.OutBridge.set(JointName, new ReplaySubject(0));
    }
    if (!Global.InBridge.has(JointName)) {
        Global.InBridge.set(JointName, new ReplaySubject());
    }
    return {
        [`${name}Out$`]: Global.OutBridge.get(JointName)!,
        [`${name}In$`]: Global.InBridge.get(JointName)!,
    } as {
        [x: `${string}Out$`]: ReplaySubject<any>;
        [y: `${string}In$`]: ReplaySubject<any>;
    };
};

const GetCurrentAtomValues = (cacheKey: string): Record<string, any> => {
    const observables = GetAtomOutObservables(cacheKey);
    const result = {} as Record<string, any>;
    Object.keys(observables).forEach((key) => {
        result[key] = observables[key].getValue();
    });
    return result;
};

const GetCurrentAtomValueByName = (CacheKey: string, name: string) =>
    GetCurrentAtomValues(CacheKey)[name];

const GetAtomOutObservables = (
    CacheKey: string,
): Record<string, BehaviorSubject<any>> => {
    const result = {} as AtomsType;
    if (Global.Store.has(CacheKey)) {
        const entries = Global.Store.get(CacheKey)!.entries();
        for (const [key, value] of entries) {
            result[key] = value.out$;
        }
    }
    return result;
};

const GetAtomOutObservableByName = (
    CacheKey: string,
    name: string,
): BehaviorSubject<any> => GetAtomOutObservables(CacheKey)[name];

const GetAtomInObservables = (
    CacheKey: string,
): Record<string, BehaviorSubject<any>> => {
    const result = {} as AtomsType;
    if (Global.Store.has(CacheKey)) {
        const entries = Global.Store.get(CacheKey)!.entries();
        for (const [key, value] of entries) {
            result[key] = value.in$;
        }
    }
    return result;
};

const GetAtomInObservableByName = (
    CacheKey: string,
    name: string,
): BehaviorSubject<any> => GetAtomInObservables(CacheKey)[name];

const SetAtomValueByName = (CacheKey: string) => (name: string, value: any) =>
    GetAtomInObservables(CacheKey)?.[name]?.next(value);

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
): Record<string, BehaviorSubject<any>>;
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
): Record<string, BehaviorSubject<any>>;
export function getInObservable(
    CacheKey: string,
    name?: string,
): BehaviorSubject<any>;
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

function destroyAtom(CacheKey: string, name: string) {
    Global.Store.get(CacheKey)?.get(name)?.destroy();
    Global.Store.get(CacheKey)?.delete(name);
}

export function destroyStore(CacheKey: string) {
    Global.Store.get(CacheKey)?.forEach((_, name) => {
        destroyAtom(CacheKey, name);
        Global.OutBridge.delete(JointState(CacheKey, name));
    });
    Global.Store.delete(CacheKey);
}
