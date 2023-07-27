
import { BehaviorSubject } from "rxjs";
import { useObservable } from "rxjs-hooks";
import {
    PluckName,
    CheckParams,
    isPlainResult,
    isJointAtom,
    generateOneDimensionRelationConfig,
    generateNameInHook,
} from "../../utils";
import {
    IConfigItemInit,
    IRelationConfig,
    ReGenConfig
} from "../../type";
import { ReGen } from "../../Builder";
import {
    getOutObservable,
    getInObservable,
    getValue,
    setValue
} from "../../Atom";
import { Delimiter } from "../../config";

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

export const useReGen = (CacheKey: string, RelationConfig: IRelationConfig, config?: ReGenConfig): IResultAtomsValue => {
    const OneDimensionRelationConfig = generateOneDimensionRelationConfig(CacheKey, RelationConfig);
    CheckParams(CacheKey, OneDimensionRelationConfig, "hook");
    const AtomInOut = ReGen(CacheKey, OneDimensionRelationConfig, config);
    const names = PluckName(OneDimensionRelationConfig);
    const initMap = OneDimensionRelationConfig.reduce((pre, item) => ({
        ...pre,
        [`${item.name}`]: item.init
    }), {} as Record<string, IConfigItemInit>);

    const reValue = {
        ReGenValue: {
            getValue: ( name?: string ) => getValue( CacheKey, name ),
            setValue: ( name: string, value?: any ) => setValue( CacheKey, name, value )
        },
        ReGenObservable: {
            getInObservable: ( name?: string ) => getInObservable(CacheKey, name),
            getOutObservable: ( name?: string ) => getOutObservable(CacheKey, name)
        }
    };

    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout = AtomInOut?.(name);
        // TODO 加上默认值
        return {
            ...pre,
            [`${name}`]: useObservable(
                () => inout?.[`${name}Out$`],
                isPlainResult(initMap[name])
                    // TODO 数据过滤
                    ? isJointAtom(initMap[name]) ? null : initMap[name]
                    : null
            ),
        };
    }, {} as IResultAtomsValue);

    const getRecordValue = (RecordKey: string) => ({
        ReGenValue: {
            getValue: ( name?: string ) => getValue( CacheKey, generateNameInHook(RecordKey, name) ),
            setValue: ( name: string, value?: any ) => {
                setValue( CacheKey, generateNameInHook(RecordKey, name)!, value );
            }
        },
        ReGenObservable: {
            getInObservable: ( name?: string ) => getInObservable(CacheKey, generateNameInHook(RecordKey, name)),
            getOutObservable: ( name?: string ) => getOutObservable(CacheKey, generateNameInHook(RecordKey, name))
        }
    });

    if (!Array.isArray(RelationConfig)) {
        const result: Record<string, any> = {};
        Object.keys(RelationConfig).forEach(RecordKey => {
            result[RecordKey] = { ...getRecordValue(RecordKey) };
            Object.keys(AtomsValue).forEach(valueName => {
                const names = valueName.split(Delimiter);
                if (RecordKey === names[0]) {
                    const key = names[1];
                    result[RecordKey][key] = AtomsValue[valueName];
                }
            });
        });
        return { ...result } as unknown as IResultAtomsValue;
    }

    return { AtomsValue, ...reValue } as unknown as IResultAtomsValue;
};
