import { useObservable } from "rxjs-hooks";
import {
    PluckName,
    CheckParams,
    generateNameInHook,
    flatRelationConfig,
    ReGen,
    getOutObservable,
    getInObservable,
    getValue,
    setValue,
    DefaultValue,
    destroyStore,
} from "../../index.ts";
import type { IConfigItem, IRelationConfig, ReGenConfig } from "../../type";
import type { IResultAtomsValue, IResultRecordAtomsValue } from "./type";
import type { ReGenHookConfig } from "./type";
import { useEffect } from "react";

const getRecordValue = (CacheKey: string, RecordKey: string) => ({
    ReGenValue: {
        getValue: (name?: string) =>
            getValue(CacheKey, generateNameInHook(RecordKey, name)),
        setValue: (name: string, value?: any) => {
            setValue(CacheKey, generateNameInHook(RecordKey, name)!, value);
        },
    },
    ReGenObservable: {
        getInObservable: (name?: string) =>
            getInObservable(CacheKey, generateNameInHook(RecordKey, name)),
        getOutObservable: (name?: string) =>
            getOutObservable(CacheKey, generateNameInHook(RecordKey, name)),
    },
});

const getReValue = (CacheKey: string) => ({
    ReGenValue: {
        getValue: (name?: string) => getValue(CacheKey, name),
        setValue: (name: string, value?: any) =>
            setValue(CacheKey, name, value),
    },
    ReGenObservable: {
        getInObservable: (name?: string) => getInObservable(CacheKey, name),
        getOutObservable: (name?: string) => getOutObservable(CacheKey, name),
    },
});

export function useReGen<
    ConfigList extends readonly IConfigItem[] | IConfigItem[][],
>(
    CacheKey: string,
    RelationConfig: ConfigList,
    config?: ReGenConfig & ReGenHookConfig,
): IResultAtomsValue<ConfigList>;
export function useReGen<
    RecordConfigItem extends Record<string, IConfigItem[] | IConfigItem[][]>,
>(
    CacheKey: string,
    RelationConfig: RecordConfigItem,
    config?: ReGenConfig & ReGenHookConfig,
): IResultRecordAtomsValue<RecordConfigItem>;
export function useReGen(
    CacheKey: string,
    RelationConfig: IRelationConfig,
    config?: ReGenConfig & ReGenHookConfig,
): any {
    useEffect(() => {
        return () => {
            if (config?.destroyOnExit ?? true) {
                destroyStore(CacheKey);
            }
        };
    }, []);
    const flatConfig = flatRelationConfig(RelationConfig);
    CheckParams(CacheKey, flatConfig, "hook");
    const AtomInOut = ReGen(CacheKey, flatConfig, config);

    const names = PluckName(flatConfig);
    // const initMap = flatConfig.reduce(
    //     (pre, item) => ({
    //         ...pre,
    //         [`${item.name}`]: item.init
    //     }),
    //     {} as Record<string, IConfigItemInit>
    // );

    const AtomsValue: IResultAtomsValue = names.reduce((pre, name) => {
        const inout = AtomInOut?.(name);
        // TODO 加上默认值
        return {
            ...pre,
            [`${name}`]: useObservable(
                () => inout?.[`${name}Out$`],
                // isPlainResult(initMap[name])
                //     ? // TODO 数据过滤
                //       isJointState(initMap[name])
                //         ? null
                //         : initMap[name]
                //     : null
            ),
        };
    }, {} as IResultAtomsValue);

    // Record 类型的参数
    if (!Array.isArray(RelationConfig)) {
        const result: Record<string, any> = {};
        Object.keys(RelationConfig).forEach((RecordKey) => {
            result[RecordKey] = { ...getRecordValue(CacheKey, RecordKey) };
            Object.keys(AtomsValue).forEach((valueName) => {
                const names = valueName.split(DefaultValue.Delimiter);
                if (RecordKey === names[0]) {
                    const key = names[1];
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    result[RecordKey][key] = AtomsValue[valueName];
                }
            });
        });
        return { ...result } as unknown as IResultRecordAtomsValue;
    }

    return {
        ...AtomsValue,
        ...getReValue(CacheKey),
    } as unknown as IResultAtomsValue;
}
