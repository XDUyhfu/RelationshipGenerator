import { IConfigItem } from "@yhfu/re-gen";
import { mergeDeepRight } from "ramda";

export const updateReValue = (name: string, value: any) => {
    // SetAtomValueByKey(CacheKey)(name, value);
    // ReValues.next(GetAtomValues(CacheKey));
};

// export const getReValues = GetAtomValues(CacheKey);

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
