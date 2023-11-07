import type { BehaviorSubject, ReplaySubject } from "rxjs";
import type { AtomState } from "./Atom";

export const Global = {
    Store: new Map<string, Map<string, AtomState>>(),
    AtomBridge: new Map<string, BehaviorSubject<any>[]>(),
    OutBridge: new Map<string, ReplaySubject<any>>(),
};

export const InitGlobal = (CacheKey: string) => {
    Global.Store.set(CacheKey, new Map<string, AtomState>());
};
