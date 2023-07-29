import {
    CombineType,
    FilterNilStage,
    IConfigItem,
    setValue
} from "@yhfu/re-gen";
import {
    Button,
    Input,
    Select
} from "@arco-design/web-react";
import {
    BehaviorSubject,
    bufferCount,
    concatMap,
    delay,
    map,
    of,
    ReplaySubject,
    switchMap,
    tap,
} from "rxjs";
import { ReForm } from "./components/re-form";
import { ReField } from "./components/re-field";
import { CacheKey } from "./context";


const testin = new ReplaySubject(2);
// const testobser = testin.pipe(
//     bufferCount(2, 1)
// );

const RelationConfig: IConfigItem[] = [
    {name: "Domain",},
    {name: "App"},
    {
        name: "typeList",
        handle: () => of(0).pipe(
                delay(2000),
                map(() => ["类型type1", "类型type2", "类型type3"])
            )
    },
    {
        name: "namesList",
        // filterNil: FilterNilStage.HandleAfter,
        // 这里不能开启过滤的原因是因为 withLatestFrom 的特性决定的
        depend: {
            names: ["type"],
            handle: (val) => of(val).pipe(
                    delay(3000),
                    map(() => ["名字name1", "名字name2", "名字name3", Date.now().toString()]),
                )
        }
    },
    {
        name: "type",
        // filterNil: FilterNilStage.In,
        // handle: async (val) => of(val).pipe(
        //         // delay(2000),
        //         tap(() => {
        //             setValue(CacheKey, "name", "");
        //         })
        //     )
    },
    {
        name: "name",
        depend: {
            names: ["type"],
            handle: (val) => of(val).pipe(
                    tap(() => testin.next(val)),
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    switchMap(() => testin.pipe(
                        bufferCount(2, 1)
                    )),
                    map((arr: [[string, string], [string,string]]) => arr?.[0]?.[1] === arr?.[1]?.[1] ? arr?.[1]?.[0] : ""),
                )
        }
    },
    {
        name: "confirm",
        filterNil: FilterNilStage.All,
        depend: {
            names: ["Domain", "App", "type", "name"],
            handle([, Domain, App, Type, Name]) {
                return {
                    Domain,
                    App,
                    Type,
                    Name
                };
            },
            combineType: CombineType.SELF_CHANGE,
        }
    }
];

function App() {
    return (
        <ReForm config={RelationConfig} style={{width: 300}} layout="vertical" initialValues={
            {
                namesListValue: "名字name2",
                typeListValue: "类型type2",
            }
        }>
            <ReField name="Domain" element={Input} label="Domain" />
            <ReField name="App" element={Input} label="App" />
            <ReField name="type" re-options="typeList" element={Select} label="typeList" />
            <ReField name="name" re-options="namesList" element={Select} label="namesList" />
            <ReField name="confirm" />
            <Button type="primary" onClick={setValue(CacheKey, "confirm")}>确认</Button>
        </ReForm>
    );
}

export default App;
