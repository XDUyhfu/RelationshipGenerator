import {
    FilterNilStage,
    IConfigItem,
    setValue
} from "@yhfu/re-gen";
import { Select } from "@arco-design/web-react";
import {
    delay,
    map,
    of,
    tap
} from "rxjs";
import { ReForm } from "./components/re-form";
import { ReField } from "./components/re-field";
import { CacheKey } from "./context";

const RelationConfig: IConfigItem[] = [
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
            names: ["typeListValue"],
            handle: ([nameList, type]) => {
                console.log([nameList, type]);
                return of(0).pipe(
                    tap(() => { console.log(type); }),
                    delay(3000),
                    map(() => ["名字name1", "名字name2", "名字name3", Date.now().toString()]),
                );
            }
        }
    },
    {
        name: "typeListValue",
        filterNil: FilterNilStage.In,
        handle: async (val) => of(val).pipe(
                delay(2000),
                tap(() => {
                    setValue(CacheKey, "namesListValue", "");
                })
            )
    },
    {name: "namesListValue",},
    {name: "infoListWithNameValue"}
];

function App() {
    return (
        <ReForm config={RelationConfig} layout="vertical" initialValues={
            {
                namesListValue: "名字name2",
                typeListValue: "类型type2",
            }
        }>
            <ReField name="typeListValue" re-options="typeList" element={Select} label="typeList" style={{width: 300}} />
            <ReField name="namesListValue" re-options="namesList" element={Select} label="namesList" style={{width: 300}} />
            {/*<ReField name="infoListWithNameValue" re-options="infoListWithName" element={Select} label="infoListWithName" style={{width: 300}}/>*/}
            {/*<ReField name="has" label="has" />*/}
        </ReForm>
    );
}

export default App;
