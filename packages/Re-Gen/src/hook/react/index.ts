import { useCallback } from "react";
import {
    BehaviorSubject,
    filter,
    isObservable
} from "rxjs";
import { useObservable } from "rxjs-hooks";
import {
    isPlainResult,
    PluckName
} from "../../utils";
import {
    IConfigItem,
    IConfigItemInit
} from "../../type";
import { ReGen } from "../../Builder";
import {
    GetAtomObservableByName,
    GetAtomObservables,
    GetCurrentAtomValueByName,
    GetCurrentAtomValues
} from "../../Atom";

export interface IResultAtomsValue {
    ReValues: {
        getValue: (name?: string) => Record<string, any> | any,
        getAtom: (name?: string) => Record<string, BehaviorSubject<any>> | BehaviorSubject<any>
    },

    [x: `${string}`]: any;
}

export interface IResultAtomsCallback {
    [x: `${string}`]: any;
}

export const useAtomsValue = (CacheKey: string, RelationConfig: IConfigItem[]) => {
    const AtomInOut = ReGen(CacheKey, RelationConfig);
    const names = PluckName(RelationConfig);
    const initMap = RelationConfig.reduce((pre, item) => ({
            ...pre,
            [`${item.name}`]: item.init
        }), {} as Record<string, IConfigItemInit>);
    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout = AtomInOut?.(name);
        return {
            ...pre,
            [`${name}`]: useObservable(
                () =>
                    inout?.[`${name}Out$`]?.pipe(
                        filter((item) => !isObservable(item))
                    ),
                isPlainResult(initMap[name])
                    ? initMap[name]
                    : null
            ),
        };
    }, {
        ReValues: {
            getValue: (name?: string) => {
                if (name) {
                    return GetCurrentAtomValueByName(CacheKey, name);
                }
                return GetCurrentAtomValues(CacheKey);
            },
            getAtom: (name?: string) => {
                if (name) {
                    return GetAtomObservableByName(CacheKey, name);
                }
                return GetAtomObservables(CacheKey);
            }
        },
    } as IResultAtomsValue);

    return AtomsValue;
};

export const useAtomsCallback = (CacheKey: string, RelationConfig: IConfigItem[]) => {
    const AtomInOut = ReGen(CacheKey, RelationConfig);
    const names = PluckName(RelationConfig);
    const AtomsCallback: IResultAtomsCallback = names.reduce((pre, name) => {
        const inout = AtomInOut?.(name);
        return {
            ...pre,
            [`${name}Callback`]: useCallback(
                (arg: any) => inout?.[`${name}In$`]?.next(arg),
                []
            ),
        };
    }, {} as IResultAtomsCallback);

    return AtomsCallback;
};
