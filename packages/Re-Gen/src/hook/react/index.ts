import { useCallback } from "react";
import { Subject, Observable, filter, isObservable } from "rxjs";
import { useObservable } from "rxjs-hooks";
import { GlobalConfig } from "../../Atom";
import {
    isPlainResult,
    PluckName
} from "../../utils";
import { DefaultAtomsValue } from "../../config";
import { IConfigItemInit } from "../../type";

type IAtomInOut = <T = any>(
    valueName: string
) => {
    [x: `${string}In$`]: Subject<T>;
    [x: `${string}Out$`]: Observable<T>;
};

export interface IResultAtomsValue<T = any> {
    [x: `${string}`]: T;
}

export interface IResultAtomsCallback<T = any> {
    [x: `${string}`]: T;
}

export const useAtomsValue = (CacheKey: string, AtomInOut: IAtomInOut) => {
    const RelationConfig = GlobalConfig.get(CacheKey)! || DefaultAtomsValue.RelationConfig;
    const names = PluckName(RelationConfig);
    const initMap = RelationConfig.reduce((pre, item) => ({
            ...pre,
            [`${item.name}`]: item.init
        }), {} as Record<string, IConfigItemInit>);
    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout = (AtomInOut ?? DefaultAtomsValue.HandleFunction)(name);
        return {
            ...pre,
            [`${name}`]: useObservable(
                () =>
                    (inout[`${name}Out$`] ?? DefaultAtomsValue.Out$).pipe(
                        filter((item) => !isObservable(item))
                    ),
                isPlainResult(initMap[name])
                    ? initMap[name]
                    : null
            ),
        };
    }, {} as IResultAtomsValue);

    return AtomsValue;
};

export const useAtomsCallback = (CacheKey: string, AtomInOut: IAtomInOut) => {
    const names = PluckName(GlobalConfig.get(CacheKey)! || DefaultAtomsValue.RelationConfig);
    const AtomsCallback: IResultAtomsCallback = names.reduce((pre, name) => {
        const inout = (AtomInOut ?? DefaultAtomsValue.HandleFunction)(name);
        return {
            ...pre,
            [`${name}Callback`]: useCallback(
                (arg: any) => (inout[`${name}In$`] || DefaultAtomsValue.In$).next(arg),
                []
            ),
        };
    }, {} as IResultAtomsCallback);

    return AtomsCallback;
};
