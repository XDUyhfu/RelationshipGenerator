import { IConfigItem } from "@yhfu/re-gen";

export interface IItem {
    id: string;
    name: string;
    init?: any;
    handle?: string; // function string类型
    dependNames?: string[];
    dependHandle?: ( val: string[] ) => any;
}


export const ConfigItems: IConfigItem[] = [
    {
        name: "Items",
        // init: [],
        depend: {
            names: ["addItem"],
            handle: ( [Items, addItem] ): IItem[] => addItem,
            reduce: ( pre: IItem[], val: IItem ) => {
                if ( !pre ) {
                    return [val];
                }
                return [...pre, val];
            }
        }
    },
    {
        name: "addItem",
        handle (): IItem {
            return { id: Date.now().toString(), name: Date.now().toString() };
        }
    },
    {
        name: "ItemNames",
        init: [],
        depend: {
            names: ["Items"],
            handle: ( [ItemNames, Items]: [ItemName: string[], Items: IItem[]] ) => Items.filter( item => item ).map( item => item.name )
        }
    },

];  