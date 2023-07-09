import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
} from "rxjs";
import { AtomsType } from "./type";
import { GlobalStore } from "./store";

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
    (cacheKey: string) =>
    <T = any>(name: string) => {
        const atom = GlobalStore.get(cacheKey)!.get(name)!;
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

export const GetAtomValues = (cacheKey: string): Record<string, any> => {
    const observables = GetAtomObservables(cacheKey);
    const result = {} as Record<string, any>;
    Object.keys(observables).forEach((key) => {
        result[key] = observables[key].getValue();
    });
    return result;
};

export const GetAtomValueByName = (cacheKey: string, name: string) =>
    GetAtomValues(cacheKey)[name];

export const GetAtomObservables = (
    cacheKey: string
): Record<string, BehaviorSubject<any>> => {
    const result = {} as AtomsType;
    if (GlobalStore.has(cacheKey)) {
        const entries = GlobalStore.get(cacheKey)!.entries();
        for (const [key, value] of entries) {
            result[key] = value.out$;
        }
    }
    return result;
};

export const GetAtomIn = (
    cacheKey: string
): Record<string, BehaviorSubject<any>> => {
    const result = {} as AtomsType;
    if (GlobalStore.has(cacheKey)) {
        const entries = GlobalStore.get(cacheKey)!.entries();
        for (const [key, value] of entries) {
            result[key] = value.in$;
        }
    }
    return result;
};
