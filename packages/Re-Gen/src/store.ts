import type { BehaviorSubject, ReplaySubject } from "rxjs";
import type { OperatorFunction } from "rxjs";
import type { AtomState } from "./Atom";

export const Global = {
    Store: new Map<string, Map<string, AtomState>>(),
    AtomBridge: new Map<string, BehaviorSubject<any>[]>(),
    OutBridge: new Map<string, ReplaySubject<any>>(),
    LoggerWatcher: new Map<
        string,
        <T>(
            marbleName: string,
            selector?: ((value: T) => any) | undefined,
        ) => OperatorFunction<T, T>
    >(),
    LoggerWatcherCache: new Map<string, boolean>(),
};

export const InitGlobal = (CacheKey: string) => {
    Global.Store.set(CacheKey, new Map<string, AtomState>());
};
