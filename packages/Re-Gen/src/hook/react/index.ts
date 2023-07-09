
import {
    BehaviorSubject,
    filter,
    isObservable
} from "rxjs";
import { useObservable } from "rxjs-hooks";
import {
    isPlainResult,
    CheckParams,
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
    GetCurrentAtomValues,
    SetAtomValueByName
} from "../../Atom";

interface IResultAtomsValue {
    ReValues: {
        getValue: (name?: string) => Record<string, any> | any,
        getAtom: (name?: string) => Record<string, BehaviorSubject<any>> | BehaviorSubject<any>
        // setValue: (name: string) => (value: any) => void;
        // setValue: (name: string, value: any) => void;
        setValue: (name: string, value?:any) => (value: any) => void | void;
    },
    [x: `${string}`]: any;
}

export const useAtomsValue = (CacheKey: string, RelationConfig: IConfigItem[]) => {
    CheckParams(CacheKey, RelationConfig);
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
            getValue: (name) => {
                if (name) {
                    return GetCurrentAtomValueByName(CacheKey, name);
                }
                return GetCurrentAtomValues(CacheKey);
            },
            getAtom: (name) => {
                if (name) {
                    return GetAtomObservableByName(CacheKey, name);
                }
                return GetAtomObservables(CacheKey);
            },
            setValue: (name, value) => {
                if (value) {
                    return SetAtomValueByName(CacheKey)(name, value);
                }
                return (value) => {
                    SetAtomValueByName(CacheKey)(name, value);
                };
            }
        },
    } as IResultAtomsValue);

    return AtomsValue;
};
