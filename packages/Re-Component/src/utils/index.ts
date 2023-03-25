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

export const updateValueByName = (name: string, value: any) => {
    SetAtomValueByKey(CacheKey)(name, value);
    ReValue.next(GetAtomValues(CacheKey));
};

export const getReValue = GetAtomValues(CacheKey);

export const ReComponent = (config: IConfigItem[]) => {
    const AtomInOut = ReGen(CacheKey, config, { logger: true });
    Atoms$.next(AtomInOut);
    Config$.next(config);
    return { ReContainer, ReField, useReValue };
};
