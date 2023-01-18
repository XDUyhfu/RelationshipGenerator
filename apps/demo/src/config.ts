// 这是一个测试的配置文件，主要用来测试生成的代码
// 主要用来制定数据之间的关系

export interface IConfigItem {
	name: string;
	init?: any;
	handle?: ( ...args: any[] ) => any;
	depend?: {
		names: string[];
		handle: ( ...args: any[] ) => any;
	};
}

export const RelationConfig: IConfigItem[] = [
	{
		name: "area",
		handle ( val ) {
			return val;
	}
},
	{
		name: "region",
		init: [],
		depend: {
			names: ["area"],
			handle ( [region, area] ) {
				return region;
			}
		},
		handle: async ( val: string[] = [] ) => val?.filter( Boolean )
	},
	{
		name: "showRegion",
		init: false,
		depend: {
			names: ["area"],
			handle ( [show, area]: [show: boolean, area: string] ) {
				if ( area === "CN" ) {
					return true;
				}
				return false;
			}
		}
	},
	{
		name: "RegionList",
		init: [],
		depend: {
			names: ["area", "region"],
			handle: async ( [list, area, region]: [list: string[], area: string, region: string[]] ) => {
				if ( area === "CN"  ) {
					if ( region?.length ) {
						return region?.filter(Boolean)?.map( item => ( {
						name: item,
						region: item
					} ));
					} else if (area) {
						
							return  [{area}];
						
					}
					return [];
				} else {
					if ( area ) {
						return [{area}];
					}
					return [];
				}
			}
		}
	},
	{
		name: "testMoreDepend",
		init: "",
		depend: {
			names: ["showRegion", "RegionList"],
			handle: async ( [testMoreDepend, showRegion, RegionList]: [testMoreDepend: string[], showRegion: boolean, RegionList: string[]] ) => JSON.stringify( showRegion ) + JSON.stringify( RegionList?.length )
		}
	},
	{
		name: "testMoreMoreDepend",
		init: "",
		depend: {
			names: ["testMoreDepend"],
			handle: async ( [testMoreMoreDepend, testMoreDepend]: [testMoreMoreDepend: string, testMoreDepend: string] ) => {
				if ( testMoreDepend === "true4" &&  testMoreMoreDepend !== "out") {
					return "full";
				} else {
					if ( testMoreMoreDepend === "out" ) {
						return "out";
					}
					return "unfull";
				}
			}
		}
	}
];

