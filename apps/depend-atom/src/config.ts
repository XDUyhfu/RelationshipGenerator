import {
    IConfigItem,
    getOutObservable,
    ReGenPrefix
} from "../../../packages/Re-Gen/src/index";

export const FirstCacheKey = "FirstCacheKey";
export const SecondCacheKey = "SecondCacheKey";

export const FirstConfig: IConfigItem[] = [
    {
        name: "atom",
        // init: { clientX: 0 },
        filterNil: true,
        handle(v) {
            return v.clientX;
        },
    },
];

export const SecondConfig: IConfigItem[] = [
    {
        name: "value",
        init: `${ReGenPrefix}:${FirstCacheKey}:atom`,
        handle(val) {
            console.log("val -- >", val);
            return val;
        },
    },
];
