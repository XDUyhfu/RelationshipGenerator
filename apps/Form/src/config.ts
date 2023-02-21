import { IConfigItem } from "@yhfu/re-gen";

interface IItem {
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
        init: [],
        depend: {
            names: ["addItem"],
            handle: ( [Items, addItem] ): IItem[] => {
                console.log( "Items", Items );
                console.log( "addItem", addItem );
                return [
                    ...Items,
                    addItem
                ];
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
            handle: ( [ItemNames, Items]: [ItemName: string[], Items: IItem[]] ) => Items.map( item => item.name )
        }
    },

];  