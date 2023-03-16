import {
    IConfigItem,
    GetAtomObservables,
} from "../../../packages/Re-Gen/src/index";
import { BehaviorSubject } from "rxjs";

export const FirstCacheKey = "FirstCacheKey";
export const SecondCacheKey = "SecondCacheKey";

export const FirstConfig: IConfigItem[] = [
    {
        name: "atom",
        handle(v) {
            return v.clientX;
        },
    },
];

const sub = new BehaviorSubject(123);

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
