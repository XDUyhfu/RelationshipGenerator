import { IConfigItem } from "@yhfu/re-gen";

export const ConfigList: IConfigItem[] = [{
    name: "keyCode",
    init: "",
    handle: ( val ) => {
        console.log( val );
        return `${ val } ${ Date.now() }`;
    }
}, { name: "inputValue" }, {
    name: "list",
    init: [],
    depend: {
        names: ["keyCode", "inputValue"],
        handle: ( [list, keyCode, inputValue] ) => [{ value: inputValue }, { value: 1 }, { value: 2 }, { value: 3 }]
    }
}, {
    name: "hightIndex",
    init: -1,
    depend: {
        names: ["keyCode", "list"],
        handle: ( [hightIndex, keyCode, list]: [index: number, keyCode: string, list: any[]] ) => {
            console.log( keyCode );
            if ( keyCode.startsWith( "ArrowDown" ) ) {
                return 1;
            } else if ( keyCode.startsWith( "ArrowUp" ) ) {
                return -1;
            }
            return 0;
        },
        reduce: ( pre, cur ) => // console.log( "cur cur ", cur );
            pre + cur

    }
}];
