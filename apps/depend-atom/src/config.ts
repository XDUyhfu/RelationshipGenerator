import {
    IConfigItem,
    GetAtomObservables,
} from "../../../packages/Re-Gen/src/index";

export const FirstCacheKey = "FirstCacheKey";
export const SecondCacheKey = "SecondCacheKey";

export const FirstConfig: IConfigItem[] = [
    {
        name: "atom",
        init: { clientX: 0 },
        handle(v) {
            return v?.clientX;
        },
    },
];

export const SecondConfig: IConfigItem[] = [
    {
        name: "value",
        init: () => GetAtomObservables(FirstCacheKey)["atom"],
        handle(val) {
            console.log("val -- >", val);
            return val;
        },
    },
];
