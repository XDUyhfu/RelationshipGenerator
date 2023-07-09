
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
    IConfigItemInit,
    ReGenConfig
} from "../../type";
import { ReGen } from "../../Builder";
import {
    getAtom,
    getValue,
    setValue
} from "../../Atom";

interface IResultAtomsValue {
    ReGenValue: {
        getValue: {
            (): Record<string, any>,
            ( name: string ): any
        },
        getAtom: {
            (): Record<string, BehaviorSubject<any>>
            (name: string): BehaviorSubject<any>
        },
        setValue: {
            (name: string): (value: any) => void,
            (name: string, value: any): void
        }
    },

    [x: `${ string }`]: any;
}

export const useReGen = (CacheKey: string, RelationConfig: IConfigItem[], config: ReGenConfig) => {
    CheckParams(CacheKey, RelationConfig);
    const AtomInOut = ReGen(CacheKey, RelationConfig, config);
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
        ReGenValue: {
            getValue: ( name?: string ) => getValue( CacheKey, name ),
            getAtom: ( name?: string ) => getAtom( CacheKey, name ),
            setValue: ( name: string, value?: any ) => setValue( CacheKey, name, value )
        },
    } as unknown as IResultAtomsValue);

    return AtomsValue;
};
