import { useCallback } from "react";
import { Subject, Observable, filter, isObservable } from "rxjs";
import { useObservable } from "rxjs-hooks";
import { GlobalConfig } from "../../Atom";
import { isPlainResult } from "../../utils/index";

type IAtomInOut = <T = any>(
    valueName: string
) => {
    [x: `${string}In$`]: Subject<T>;
    [x: `${string}Out$`]: Observable<T>;
};

interface IResultAtomsValue<T = any> {
    [x: `${string}`]: T;
}

interface IResultAtomsCallback<T = any> {
    [x: `${string}`]: T;
}

export const useAtomsValue = (cacheKey: string, AtomInOut: IAtomInOut) => {
    const RelationConfig = GlobalConfig.get(cacheKey)!;
    const names = RelationConfig.map((item) => item.name);
    const getConfigItem = (name: string) =>
        RelationConfig.filter((item) => item.name === name)[0];
    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout$ = AtomInOut(name);
        return {
            ...pre,
            [`${name}`]: useObservable(
                () =>
                    inout$[`${name}Out$`].pipe(
                        filter((item) => !isObservable(item))
                    ),
                isPlainResult(getConfigItem(name)?.init)
                    ? getConfigItem(name)?.init
                    : null
            ),
        };
    }, {} as IResultAtomsValue);

    return AtomsValue;
};

export const useAtomsCallback = (cacheKey: string, AtomInOut: IAtomInOut) => {
    const RelationConfig = GlobalConfig.get(cacheKey)!;
    const names = RelationConfig.map((item) => item.name);
    const AtomsCallback: IResultAtomsCallback = names.reduce((pre, name) => {
        const inout$ = AtomInOut(name);
        return {
            ...pre,
            [`${name}Callback`]: useCallback(
                (arg: any) => inout$[`${name}In$`].next(arg),
                []
            ),
        };
    }, {} as IResultAtomsCallback);

    return AtomsCallback;
};
