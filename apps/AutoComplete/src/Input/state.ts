import type { IConfigItem } from "@yhfu/re-gen";

export const ConfigList: IConfigItem[] = [{
	distinct: false,
	init: "",
	name: "keyCode"
}, { name: "inputValue" }, {
	name: "list",
	init: [],
	depend: {
		names: ["inputValue"],
		handle: ( [list, inputValue] ) => [{ value: inputValue }, { value: 1 }, { value: 2 }, { value: 3 }]
	}
}, {
	name: "hightIndex",
	init: -1,
	depend: {
		names: ["keyCode"],
		handle: ( [hightIndex, keyCode]: [index: number, keyCode: string, list: any[]] ) => {
			if ( keyCode.startsWith( "ArrowDown" ) ) {
				return 1;
			} else if ( keyCode.startsWith( "ArrowUp" ) ) {
				return -1;
			}
			return 0;
		},
		reduce: ( pre, cur ) => // console.log( "cur cur ", cur );
			(pre + cur)
	}
}];
