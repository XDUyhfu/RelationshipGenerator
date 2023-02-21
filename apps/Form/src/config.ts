import { IConfigItem } from "@yhfu/re-gen";

export interface IItem {
    id: string;
    name: string;
    init?: any;
    handle?: string; // function string类型
    dependNames?: string[];
    dependHandle?: ( val: string[] ) => any;
}

function uniqueFunc ( arr: any, uniId: string ) {
    const res = new Map();
    return arr.filter( ( item: any ) => !res.has( item[uniId] ) && res.set( item[uniId], 1 ) );
}


export const ConfigItems: IConfigItem[] = [
    {
        name: "Items",
        init: [],
        depend: {
            names: ["addItem", "name"],
            handle: ( [Items, addItem, name] ): object => ( {
                item: addItem,
                updateName: name
            } ),
            reduce: ( pre: IItem[], val: { item: IItem; updateName: { id: string; value: string; }; } ) => {
                if ( !pre ) {
                    return val.item ? [val.item] : [];
                }
                if ( val.updateName ) {
                    const index = pre.findIndex( item => item.id === val.updateName.id );
                    if ( index >= 0 ) {
                        pre[index].name = val?.updateName?.value;
                    }
                }
                return uniqueFunc( [...pre, val.item].filter( item => item ), "id" );
            }
        }
    },
    {
        name: "addItem",
        handle ( e ) {
            return e ? { id: Date.now().toString() + Math.random().toString().slice( 4 ), name: "" } : undefined;
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
    { name: "name", init: {} }
];  