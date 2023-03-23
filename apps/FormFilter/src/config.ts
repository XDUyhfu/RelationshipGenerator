import { TabsProps } from "antd";
import dayjs from "dayjs";
import type { IConfigItem } from "../../../packages/Re-Gen/src/index";
import { SetAtomValueByKey } from "../../../packages/Re-Gen/src/index";

export const DateFormat = "YYYY-MM-DD HH:mm:ss";
export const DayFormat = "YYYY-MM-DD";

export const CacheKey = "FORM_FILTER";

export const RelationConfig: IConfigItem[] = [
    {
        name: "domain",
        init: [],
    },
    {
        name: "shortcut",
        init: "600",
    },
    {
        name: "time",
        init: [],
        handle: (value) => {
            if (value.length) {
                // SetAtomValue(atoms, "shortcut")(0);
                SetAtomValueByKey(CacheKey, "shortcut", 0);
            }
            return value;
        },
        depend: {
            names: ["shortcut"],
            handle([time, shortcut]: [time: string[], shortcut: string]) {
                if (shortcut === "600") {
                    return [
                        dayjs().subtract(600, "s").format(DateFormat),
                        dayjs(Date.now()).format(DateFormat),
                    ];
                } else if (shortcut === "3600") {
                    return [
                        dayjs().subtract(3600, "s").format(DateFormat),
                        dayjs(Date.now()).format(DateFormat),
                    ];
                } else if (shortcut === "86400") {
                    return [
                        dayjs().subtract(86400, "s").format(DateFormat),
                        dayjs(Date.now()).format(DateFormat),
                    ];
                }

                return time;
            },
        },
    },
    {
        name: "aggregation",
        init: "300",
    },
    {
        name: "area",
        init: "",
    },
    {
        name: "region",
        init: [],
    },
    {
        name: "ip",
        init: [],
    },
    {
        name: "regionShow",
        init: false,
        depend: {
            names: ["area", "tab"],
            handle: ([, area, tab]) => {
                if (area === "CN" || tab === "3") {
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
            names: ["area", "region", "tab"],
            handle: async ([, area, region, tab]: [
                list: string[],
                area: string,
                region: string[],
                tab: string
            ]) => {
                if (tab !== "3") {
                    if (area === "CN") {
                        if (region?.length) {
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
                } else {
                    if (region?.length) {
                        return region?.filter(Boolean)?.map((item) => ({
                            name: item,
                            region: item,
                        }));
                    }
                }
                return [];
            },
        },
    },
    {
        name: "SelectableTimeRange",
        init: [
            dayjs()
                .subtract(7 * 24 * 3600, "s")
                .format(DateFormat),
            dayjs(Date.now()).format(DayFormat),
        ],
        depend: {
            names: ["aggregation"],
            handle: ([, aggregation]) => {
                if (aggregation === "300") {
                    return [
                        dayjs()
                            .subtract(7 * 24 * 3600, "s")
                            .format(DateFormat),
                        dayjs(Date.now()).format(DayFormat),
                    ];
                } else if (aggregation === "600") {
                    return [
                        dayjs()
                            .subtract(30 * 24 * 3600, "s")
                            .format(DateFormat),
                        dayjs(Date.now()).format(DateFormat),
                    ];
                } else if (aggregation === "3600") {
                    return [
                        dayjs()
                            .subtract(91 * 24 * 3600, "s")
                            .format(DateFormat),
                        dayjs(Date.now()).format(DateFormat),
                    ];
                }
                return [];
            },
        },
    },
    {
        name: "tab",
        init: "1",
    },
    {
        name: "areaShow",
        init: true,
        depend: {
            names: ["tab"],
            handle: ([, tab]) => {
                if (tab === "3") {
                    return false;
                }
                return true;
            },
        },
    },
    {
        name: "confirm",
        init: {},
        depend: {
            combineType: "self",
            names: ["domain", "time", "aggregation", "RegionList"],
            handle: ([, domain, time, aggregation, regionList]) => ({
                domain,
                time,
                aggregation,
                regionList,
            }),
        },
    },
];

export const TabItems: TabsProps["items"] = [
    {
        key: "1",
        label: "Tab 1",
    },
    {
        key: "2",
        label: "Tab 2",
    },
    {
        key: "3",
        label: "Tab 3",
    },
];
