// 这是一个测试的配置文件，主要用来测试生成的代码
// 主要用来制定数据之间的关系

import { IConfigItem } from "../../../packages/Re-Gen/src/index";
import { filter, from, map, of, toArray } from "rxjs";

export const RelationConfig: IConfigItem[] = [
    {
        name: "area",
        // init: of("CN"),
        handle(val) {
            return of(val);
        },
    },
    {
        name: "region",
        // init: [],
        handle: (val: string[] = []) =>
            from(val).pipe(
                filter(Boolean),
                map((item) => item?.toLocaleUpperCase()),
                toArray()
            ),
    },
    {
        name: "showRegion",
        init: false,
        depend: {
            names: ["area"],
            handle([, area]: [show: boolean, area: string]) {
                if (area === "CN") {
                    return true;
                }
                return false;
            },
        },
    },
    {
        name: "RegionList",
        init: [],
        depend: {
            names: ["area", "region"],
            handle: async ([list, area, region]: [
                list: string[],
                area: string,
                region: string[]
            ]) => {
                if (area === "CN") {
                    if (Array.isArray(region) && region.length) {
                        return region?.filter(Boolean)?.map((item) => ({
                            name: item,
                            region: item,
                        }));
                    } else if (area) {
                        return [{ area }];
                    }
                    return [];
                } else {
                    if (area) {
                        return [{ area }];
                    }
                    return [];
                }
            },
        },
    },
    {
        name: "testMoreDepend",
        init: "",
        depend: {
            names: ["showRegion", "RegionList"],
            handle: async ([testMoreDepend, showRegion, RegionList]: [
                testMoreDepend: string[],
                showRegion: boolean,
                RegionList: string[]
            ]) =>
                JSON.stringify(showRegion) + JSON.stringify(RegionList?.length),
        },
    },
    {
        name: "testMoreMoreDepend",
        init: "",
        depend: {
            names: ["testMoreDepend"],
            handle: async ([testMoreMoreDepend, testMoreDepend]: [
                testMoreMoreDepend: string,
                testMoreDepend: string
            ]) => {
                if (
                    testMoreDepend === "true4" &&
                    testMoreMoreDepend !== "out"
                ) {
                    return "full";
                } else {
                    if (testMoreMoreDepend === "out") {
                        return "out";
                    }
                    return "unfull";
                }
            },
        },
    }, // {
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
