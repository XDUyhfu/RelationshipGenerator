import {
    GetAtomValues,
    IConfigItem,
    ReGen,
    SetAtomValueByKey,
} from "@yhfu/re-gen";
import { Atoms$, CacheKey, Config$, ReValues } from "../context";
import { ReComponentOptions } from "../type";
import { mergeDeepRight } from "ramda";

export const updateReValue = (name: string, value: any) => {
    SetAtomValueByKey(CacheKey)(name, value);
    ReValues.next(GetAtomValues(CacheKey));
};

export const getReValues = GetAtomValues(CacheKey);

export const RewriteOrExpendConfig = (
    rec: IConfigItem[],
    config: IConfigItem[]
) => {
    const expend = rec.filter(
        (item) => !config.map((it) => it.name).includes(item.name)
    );
    const rewrite = config.map((item) => {
        const index = rec.findIndex((it) => it.name === item.name);
        if (index >= 0) {
            return mergeDeepRight(item, rec[index]) as IConfigItem;
        }
        return item;
    });

    return [...rewrite, ...expend];
};

export const ReComponent = (
    config: IConfigItem[],
    options?: ReComponentOptions
) => {
    const { logger = false, rewriteOrExpendConfig = [] } = options ?? {};
    const AtomInOut = ReGen(
        CacheKey,
        RewriteOrExpendConfig(rewriteOrExpendConfig, config),
        { logger }
    );
    Atoms$.next(AtomInOut);
    Config$.next(config);
};
