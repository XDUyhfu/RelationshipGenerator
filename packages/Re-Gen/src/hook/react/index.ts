import { useCallback } from "react";
import { filter, isObservable } from "rxjs";
import { useObservable } from "rxjs-hooks";
import {
    isPlainResult,
    PluckName
} from "../../utils";
import {
    IConfigItem,
    IConfigItemInit,
    ReGenOptions
} from "../../type";
import { ReGen } from "../../Builder";

export interface IResultAtomsValue<T = any> {
    [x: `${string}`]: T;
}

export interface IResultAtomsCallback<T = any> {
    [x: `${string}`]: T;
}

export const useAtomsValue = (CacheKey: string, RelationConfig: IConfigItem[], options?: ReGenOptions) => {
    const AtomInOut = ReGen(CacheKey, RelationConfig, options);
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
    }, {} as IResultAtomsValue);

    return AtomsValue;
};

export const useAtomsCallback = (CacheKey: string, RelationConfig: IConfigItem[], options?: ReGenOptions) => {
    const AtomInOut = ReGen(CacheKey, RelationConfig, options);
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
