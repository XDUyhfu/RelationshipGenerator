// 这是一个测试的配置文件，主要用来测试生成的代码
// 主要用来制定数据之间的关系

// import dayjs from "dayjs";

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
		init: "",
		handle ( val ) {
			return val;
	}
},
	{
		name: "region",
		handle: async ( val: string[] = [] ) => val?.filter( Boolean )
	},
	{
		name: "showRegion",
		init: false,
		depend: {
			names: ["area"],
			handle ( [show, area]: [show: boolean, area: string] ) {
				if ( area=== "CN" ) {
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
			handle:async ( [list, area, region]: [list: string[], area: string, region: string[]] )=> {
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
			handle: async ( [testMoreDepend, showRegion, RegionList]: [testMoreDepend: string[], showRegion: boolean, RegionList: string[]] ) => testMoreDepend ?testMoreDepend: JSON.stringify( showRegion ) + JSON.stringify( RegionList?.length )
		}
	},
	{
		name: "testMoreMoreDepend",
		init: "",
		depend: {
			names: ["testMoreDepend"],
			handle: async ( [testMoreMoreDepend, testMoreDepend]: [testMoreMoreDepend: string, testMoreDepend: string] ) => {
				console.log(testMoreMoreDepend);
				if ( testMoreDepend === "true4" &&  testMoreMoreDepend !== "out") {
					return "full";
				} else {
					if ( testMoreMoreDepend === "out" ) {
						console.log("return out");
						return "out";
					}
					return "unfull";
				}
			}
		}
	}
];

// export const RelationConfig: IConfigItem[] = [{
// 	name: "time",
// 	init: [dayjs().subtract(
// 		600,
// 		"seconds"
// 	).format( "YYYY-MM-DD HH:mm" ), dayjs().format( "YYYY-MM-DD HH:mm" )],
// 	handle ( val ) {
// 		return val;
// 	},
// 	depend: {
// 		names: ["shortcut"],
// 		handle ( [_, shortcut] ) {
// 			return [dayjs().subtract(
// 				parseInt( shortcut ),
// 				"seconds"
// 			).format( "YYYY-MM-DD HH:mm" ), dayjs().format( "YYYY-MM-DD HH:mm" )];
// 		}
// 	},
// }, {
// 	name: "shortcut",
// 	init: 600,
// 	handle ( val ) {
// 		return val / 10 || 0;
// 	},
// 	depend: {
// 		names: ["time"],
// 		handle ( [shortcut] ) {
// 			return shortcut;
// 		}
// 	}
// },
// {
// 	name: "aggregation",
// 	init: 60,
// 	handle ( value ) {
// 		return value;
// 	}
// 	}, {
// 	name: "regionShowState",
// 	init: false,
// 	depend: {
// 		names: ["shortcut", "time", "aggregation"],
// 		handle ([state, shortcut, time, aggregation]) {
// 			console.log( state, shortcut, time, aggregation );
// 			if ( JSON.stringify(shortcut) === "90" ) {
// 				return false;
// 			}
// 			return true;
// 		}
// 	}
// }];
