
import { BehaviorSubject } from "rxjs";
import { useObservable } from "rxjs-hooks";
import {
    PluckName,
    CheckParams,
} from "../../utils";
import {
    IConfigItem,
    ReGenConfig
} from "../../type";
import { ReGen } from "../../Builder";
import {
    getOutObservable,
    getInObservable,
    getValue,
    setValue
} from "../../Atom";

interface IResultAtomsValue {
    ReGenValue: {
        getValue: {
            (): Record<string, any>,
            ( name: string ): any
        },
        setValue: {
            (name: string): (value: any) => void,
            (name: string, value: any): void
        }
    },
    ReGenObservable: {
        getInObservable: {
            (): Record<string, BehaviorSubject<any>>,
            ( name: string ): BehaviorSubject<any>
        },
        getOutObservable: {
            (): Record<string, BehaviorSubject<any>>,
            ( name: string ): BehaviorSubject<any>
        }
    }

    [x: `${ string }`]: any;
}

export const useReGen = (CacheKey: string, RelationConfig: IConfigItem[], config?: ReGenConfig) => {
    CheckParams(CacheKey, RelationConfig, "hook");
    const AtomInOut = ReGen(CacheKey, RelationConfig, config);
    const names = PluckName(RelationConfig);
    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout = AtomInOut?.(name);
        return {
            ...pre,
            [`${name}`]: useObservable(
                () =>
                    inout?.[`${name}Out$`],
            ),
        };
    }, {
        ReGenValue: {
            getValue: ( name?: string ) => getValue( CacheKey, name ),
            setValue: ( name: string, value?: any ) => setValue( CacheKey, name, value )
        },
        ReGenObservable: {
            getInObservable: ( name?: string ) => getInObservable(CacheKey, name),
            getOutObservable: ( name?: string ) => getOutObservable(CacheKey, name)
        }
    } as IResultAtomsValue);

    return AtomsValue;
};
