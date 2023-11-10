import type { BehaviorSubject, ReplaySubject } from "rxjs";
import type { AtomState } from "./Atom";

export const Global = {
    Store: new Map<string, Map<string, AtomState>>(),
    AtomBridge: new Map<
        string,
        (BehaviorSubject<any> | ReplaySubject<any>)[]
    >(),
    OutBridge: new Map<string, Map<string, BehaviorSubject<any>>>(),
    InBridge: new Map<string, Map<string, ReplaySubject<any>>>(),
    InitValue: new Map<string, any>(),
};

export const InitGlobal = (CacheKey: string) => {
    Global.Store.set(CacheKey, new Map<string, AtomState>());
};
