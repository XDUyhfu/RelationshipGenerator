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
                SetAtomValueByKey(CacheKey)("shortcut", 0);
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
    { name: "area" },
    {
        name: "protocal",
        init: [],
    },
    {
        name: "operator",
        init: [],
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

export const TabItems = [
    {
        key: "1",
        title: "Tab 1",
    },
    {
        key: "2",
        title: "Tab 2",
    },
    {
        key: "3",
        title: "Tab 3",
    },
];

export const DomainOption = [
    {
        value: "1.test.pull.com",
        label: "1.test.pull.com",
    },
    {
        value: "2.test.pull.com",
        label: "2.test.pull.com",
    },
    {
        value: "3.test.pull.com",
        label: "3.test.pull.com",
    },
    {
        value: "4.test.pull.com",
        label: "4.test.pull.com",
    },
];

export const ShortcutOption = [
    {
        label: "10分钟",
        value: "600",
    },
    {
        label: "1小时",
        value: "3600",
    },
    {
        label: "1天",
        value: "86400",
    },
];

export const AggregationOption = [
    { value: "300", label: "5分钟" },
    { value: "600", label: "10分钟" },
    { value: "3600", label: "1小时" },
];

export const ProtocalOption = [
    {
        value: "FLV",
        label: "FLV",
    },
    {
        value: "HLS",
        label: "HLS",
    },
    {
        value: "RTM",
        label: "RTM",
    },
    {
        value: "RTMP",
        label: "RTMP",
    },
    {
        value: "SRT",
        label: "SRT",
    },
    {
        value: "QUIC",
        label: "QUIC",
    },
];

export const AreaOption = [
    { value: "CN", label: "中国大陆" },
    { value: "AP1", label: "亚太1区" },
    { value: "AP2", label: "亚太2区" },
    { value: "Oversea", label: "海外大区" },
];

export const RegionOption = [
    { value: "BJ", label: "北京" },
    { value: "SH", label: "上海" },
    { value: "NJ", label: "南京" },
    { value: "HN", label: "河南" },
];

export const OperatorOption = [
    {
        value: "mobile",
        label: "移动",
    },
    {
        value: "unicom",
        label: "联通",
    },
    {
        value: "telecom",
        label: "电信",
    },
];
