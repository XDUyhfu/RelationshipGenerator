import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
} from "rxjs";
import { AtomsType } from "./type";
import { Global } from "./store";
import { isNil } from "ramda";

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

 const GetCurrentAtomValues = (cacheKey: string): Record<string, any> => {
    const observables = GetAtomObservables(cacheKey);
    const result = {} as Record<string, any>;
    Object.keys(observables).forEach((key) => {
        result[key] = observables[key].getValue();
    });
    return result;
};

 const GetCurrentAtomValueByName =(CacheKey: string, name: string) =>
    GetCurrentAtomValues(CacheKey)[name];

 const GetAtomObservables = (
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
 const GetAtomObservableByName = (
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

const SetAtomValueByName =
    (CacheKey: string) => (name: string, value: any) =>
        GetAtomIn(CacheKey)?.[name]?.next(value);


export function getValue(CacheKey: string): Record<string, any>
export function getValue(CacheKey: string, name?: string): any
export function getValue(CacheKey: string, name?: string)  {
    if (name) {
        return GetCurrentAtomValueByName(CacheKey, name);
    }
    return GetCurrentAtomValues(CacheKey);
}

export function getAtom(CacheKey: string): Record<string, BehaviorSubject<any>>
export function getAtom(CacheKey: string, name?: string): BehaviorSubject<any>
export function getAtom(CacheKey: string, name?: string) {
    if (name) {
        return GetAtomObservableByName(CacheKey, name);
    }
    return GetAtomObservables(CacheKey);
}

export function setValue(CacheKey: string, name: string): (value: any) => void
export function setValue(CacheKey: string, name: string, value?: any): void
export function setValue(CacheKey:string, name:string, value?:any) {
    if (!isNil(value)) {
        SetAtomValueByName(CacheKey)(name, value);
        return;
    }
    return (value: any) => {
        SetAtomValueByName(CacheKey)(name, value);
    };
}




