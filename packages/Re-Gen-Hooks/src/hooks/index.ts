import { useCallback } from "react";
import { Subject, Observable } from "rxjs";
import { useObservable } from "rxjs-hooks";
import type { IConfigItem } from "@yhfu/re-gen";
import { isPlainResult } from "./utils";

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

export const useAtomsValue = (
    AtomInOut: IAtomInOut,
    RelationConfig: IConfigItem[]
) => {
    const names = RelationConfig.map((item) => item.name);
    const getConfigItem = (name: string) =>
        RelationConfig.filter((item) => item.name === name)[0];
    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout$ = AtomInOut(name);
        return {
            ...pre,
            [`${name}`]: useObservable(
                () => inout$[`${name}Out$`],
                isPlainResult(getConfigItem(name)?.init)
                    ? getConfigItem(name)?.init
                    : null
            ),
        };
    }, {} as IResultAtomsValue);

    return AtomsValue;
};

export const useAtomsCallback = (
    AtomInOut: IAtomInOut,
    RelationConfig: IConfigItem[]
) => {
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
