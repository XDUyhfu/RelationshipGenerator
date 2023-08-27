import { BehaviorSubject, OperatorFunction, ReplaySubject } from "rxjs";
import { IConfigItem, PluckValueType } from "./type";
import { AtomState } from "./Atom";
import { isInit, isValidRelationConfig, PluckValue } from "./utils";

export const Global = {
    Store: new Map<string, Map<string, AtomState>>(),
    RelationConfig: new Map<string, PluckValueType[]>(),
    AtomBridge: new Map<string, BehaviorSubject<any>[]>(),
    Buffer: new Map<string, Map<string, ReplaySubject<any[]>>>(),
    LoggerWatcher: new Map<
        string,
        <T>(
            marbleName: string,
            selector?: ((value: T) => any) | undefined
        ) => OperatorFunction<T, T>
    >(),
};

export const InitGlobalValue = (
    CacheKey: string,
    RelationConfig: IConfigItem[]
) => {
    if (isInit(CacheKey) && isValidRelationConfig(RelationConfig)) {
        Global.Store.set(CacheKey, new Map<string, AtomState>());
        Global.RelationConfig.set(CacheKey, PluckValue(RelationConfig));
        Global.Buffer.set(CacheKey, new Map<string, ReplaySubject<any[]>>());
    }
};
