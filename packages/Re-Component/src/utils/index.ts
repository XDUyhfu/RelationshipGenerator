import {
    GetAtomValues,
    IConfigItem,
    ReGen,
    SetAtomValueByKey,
} from "@yhfu/re-gen";
import { Atoms$, CacheKey, Config$, ReValue } from "../context";
import { ReContainer } from "../components/re-container";
import { ReField } from "../components/re-field";
import { useReValue } from "../hook";
import { ReComponentOptions } from "../type";

export const updateValueByName = (name: string, value: any) => {
    SetAtomValueByKey(CacheKey)(name, value);
    ReValue.next(GetAtomValues(CacheKey));
};

export const getReValue = GetAtomValues(CacheKey);

export const InitRecordToConfig = (
    init: Record<string, any>,
    config: IConfigItem[]
) => {
    const initKeys = Object.keys(init);
    return config.map((item) => {
        if (initKeys.includes(item.name)) {
            return {
                ...item,
                init: init[item.name],
            };
        }
        return item;
    });
};

export const ReComponent = (
    config: IConfigItem[],
    options?: ReComponentOptions
) => {
    const { initialValues = {}, logger = false } = options ?? {};
    const AtomInOut = ReGen(
        CacheKey,
        InitRecordToConfig(initialValues, config),
        { logger }
    );
    Atoms$.next(AtomInOut);
    Config$.next(config);
    return { ReContainer, ReField, useReValue };
};
