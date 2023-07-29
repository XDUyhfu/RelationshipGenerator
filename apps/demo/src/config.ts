import {
    BehaviorSubject,
    delay,
    filter,
    from,
    interval,
    map,
    switchMap,
    toArray
} from "rxjs";
import {
    CombineType,
    IConfigItem
} from "../../../packages/Re-Gen/src";

export const RelationConfig: IConfigItem[] = [
    {
        name: "area",
        init: new BehaviorSubject("CN").pipe(
            delay(3000),
            switchMap(() => interval(3000)),
        ),
        handle(val) {
            return new BehaviorSubject(val);
        },
    },
    {
        name: "region",
        init: ["ni", "hello"],
        handle: (val: string[] = []) => from(val).pipe(
                filter(Boolean),
                map((item) => item?.toLocaleUpperCase()),
            ),
    },
    {
        name: "showRegion",
        init: false,
        filterNil: true,
        depend: {
            names: ["area"],
            // combineType: CombineType.SELF_CHANGE,
            handle(aa: [show: boolean, area:string], isChange, beforeAndCurrent, ) {
                if (aa?.[1] === "CN") {
                    return true;
                }
                return false;
            },
        },
    },
    // {
    //     name: "RegionList",
    //     init: [],
    //     depend: {
    //         names: ["area", "region"],
    //         handle: async ([list, area, region]: [
    //             list: string[],
    //             area: string,
    //             region: string[]
    //         ]) => {
    //             if (area === "CN") {
    //                 if (Array.isArray(region) && region.length) {
    //                     return region?.filter(Boolean)?.map((item) => ({
    //                         name: item,
    //                         region: item,
    //                     }));
    //                 } else if (area) {
    //                     return [{ area }];
    //                 }
    //                 return [];
    //             } else {
    //                 if (area) {
    //                     return [{ area }];
    //                 }
    //                 return [];
    //             }
    //         },
    //     },
    // },
    // {
    //     name: "testMoreDepend",
    //     init: "",
    //     depend: {
    //         names: ["showRegion", "RegionList"],
    //         handle: async ([testMoreDepend, showRegion, RegionList]: [
    //             testMoreDepend: string[],
    //             showRegion: boolean,
    //             RegionList: string[]
    //         ]) =>
    //             JSON.stringify(showRegion) + JSON.stringify(RegionList?.length),
    //     },
    // },
    // {
    //     name: "testMoreMoreDepend",
    //     init: "",
    //     depend: {
    //         names: ["testMoreDepend"],
    //         handle: async ([testMoreMoreDepend, testMoreDepend]: [
    //             testMoreMoreDepend: string,
    //             testMoreDepend: string
    //         ]) => {
    //             if (
    //                 testMoreDepend === "true4" &&
    //                 testMoreMoreDepend !== "out"
    //             ) {
    //                 return "full";
    //             } else {
    //                 if (testMoreMoreDepend === "out") {
    //                     return "out";
    //                 }
    //                 return "unfull";
    //             }
    //         },
    //     },
    // }, // {
    //     name: "confirm",
    //     init: "click",
    //     depend: {
    //         names: ["area", "region"],
    //         combineType: "every",
    //         handle: ([_, area, region]) => ({
    //             area,
    //             region,
    //         }),
    //     },
    // },
];
export const RelationConfig2: IConfigItem[] = [
    {
        name: "area",
        init: new BehaviorSubject("CN").pipe(
            delay(1000),
            switchMap(() => interval(1000)),
        ),
        // init: "CN",
        handle(val) {
            // console.log("handle");
            return new BehaviorSubject(val);
        },
        interceptor: {
            before: (val) =>
                // console.log("before");
                 `${val}123`
            ,
            after: (value) =>
                // console.log("after");
                 `${value}-456`

        }
    },
];
