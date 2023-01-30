import dayjs from "dayjs";

export interface IConfigItem {
	name: string;
	init?: any;
	handle?: ( ...args: any[] ) => any;
	depend?: {
		names: string[];
		handle: ( ...args: any[] ) => any;
	};
}

export const DateFormat = "YYYY-MM-DD HH:mm:ss";
export const DayFormat = "YYYY-MM-DD";

export const RelationConfig: IConfigItem[] = [
	{ name: "domain", init:[]},
	{
		name: "shortcut",
		init: "600",
		depend: {
			names: ["time"],
			handle: ([shortcut, time]) => shortcut
		}
	},
	{
		name: "time",
		init: [dayjs().subtract(600, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)],
		depend: {
			names: ["shortcut"],
			handle ( [time, shortcut]: [time: string[], shortcut: string] ) {
			
				if ( shortcut === "600" ) {
					return [dayjs().subtract(600, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)]; 
				} else if ( shortcut === "3600" ) {
					return [dayjs().subtract(3600, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)]; 
				} else if ( shortcut === "86400" ) {
					return [dayjs().subtract(86400, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)]; 
				}
				
				return time;
			}
		}
	},
	{
		name: "aggregation",
		init: "300"
	},
	{ name: "area", },
	{ name: "region", init: [] },
	{ name: "ip" },
	{
		name: "regionShow",
		init: false,
		depend: {
			names: ["area"],
			handle: ([regionShow, area]) => {
				if ( area === "CN" ) {
					return true;
				}
				return false;
			}
		}
	},
	{
		name: "RegionList",
		depend: {
			names: ["area", "region"],
			handle: async ( [list, area, region]: [list: string[], area: string, region: string[]] ) => {
				if ( area === "CN" ) {
					if ( region?.length ) {
						return region?.filter( Boolean )?.map( item => ( {
							name: item,
							region: item
						} ) );
					} else if ( area ) {
						return [{ area }];
					}
					return [];
				} else {
					if ( area ) {
						return [{ area }];
					}
					return [];
				}
			}
		}
	},
	{
		name: "SelectableTimeRange",
		init: [dayjs().subtract(7 * 24 * 3600, "s").format(DateFormat), dayjs(Date.now()).format(DayFormat)],
		depend: {
			names: ["aggregation"],
			handle: ( [SelectableTimeRange, aggregation] ) => {
				if ( aggregation === "300" ) {
					return [dayjs().subtract(7 * 24 * 3600, "s").format(DateFormat), dayjs(Date.now()).format(DayFormat)];
				} else if ( aggregation === "600" ) {
					return [dayjs().subtract(30 * 24 * 3600, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)];
				} else if ( aggregation === "3600" ) {
					return [dayjs().subtract(91 * 24 * 3600, "s").format(DateFormat), dayjs(Date.now()).format(DateFormat)];
				}
				return [];
			}
		}
	}
];

export const CacheKey = "FORM_FILTER";

