import { of } from "rxjs";
import { IConfigItem } from "../../../packages/Re-Gen/src/index";

export const Config: IConfigItem[] = [
    { name: "add" },
    {
        name: "test",
        depend: {
            names: ["add"],
            handle: ([add, data]) =>
                of({
                    value: Date.now(),
                    id: Date.now(),
                }),
        },
        reduce: {
            handle: (pre, val) => [...pre, val],
            init: [],
        },
    },
    {
        name: "inputValue",
        handle: (val) => of(val),
        distinct: false,
        depend: {
            names: ["add"],
            handle([inputValue, add]) {
                return of([]);
            },
        },
    },
    {
        name: "result",
        init: of([{ key: 123 }]),
        distinct: false,
        depend: {
            names: ["add"],
            handle([result, add, inputValue]: [
                result: any[],
                add: any[],
                inputValue: any[]
            ]) {
                return of([]);
            },
        },
    },
];
