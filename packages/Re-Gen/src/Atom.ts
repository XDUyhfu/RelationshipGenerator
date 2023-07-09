import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
} from "rxjs";
import { AtomsType } from "./type";
import { Global } from "./store";

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

export const AtomInOut =
    (CacheKey: string) =>
    <T = any>(name: string) => {
        const atom = Global.Store.get(CacheKey)!.get(name)!;
        if (!atom) {
            throw new Error(`用于构建的配置列表中不包含该 ${name} 值`);
        }
        return {
            [`${name}In$`]: atom.in$,
            [`${name}Out$`]: atom.out$,
        } as {
            [x: `${string}In$`]: BehaviorSubject<T>;
            [x: `${string}Out$`]: Observable<T>;
        };
    };

export const GetCurrentAtomValues = (cacheKey: string): Record<string, any> => {
    const observables = GetAtomObservables(cacheKey);
    const result = {} as Record<string, any>;
    Object.keys(observables).forEach((key) => {
        result[key] = observables[key].getValue();
    });
    return result;
};

export const GetCurrentAtomValueByName =(CacheKey: string, name: string) =>
    GetCurrentAtomValues(CacheKey)[name];

export const GetAtomObservables = (
    CacheKey: string
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

export const GetAtomObservableByName = (
    CacheKey: string, name: string
): BehaviorSubject<any> => GetAtomObservables(CacheKey)[name];

const GetAtomIn = (
    CacheKey: string
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

export const SetAtomValueByName =
    (CacheKey: string) => (name: string, value: any) =>
        GetAtomIn(CacheKey)?.[name]?.next(value);
