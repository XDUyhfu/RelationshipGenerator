import { CombineType, FilterNilStage, IConfigItem } from "@yhfu/re-gen";
import { Button, Input, Select } from "@arco-design/web-react";
import { delay, map, of } from "rxjs";
import { ReForm } from "./components/re-form";
import { ReField } from "./components/re-field";

const RelationConfig: IConfigItem[] = [
    {
        name: "typeList",
        handle: () =>
            of(0).pipe(
                delay(2000),
                map(() => ["类型type1", "类型type2", "类型type3"])
            ),
    },
    {
        name: "namesList",
        // filterNil: FilterNilStage.HandleAfter,
        // 这里不能开启过滤的原因是因为 withLatestFrom 的特性决定的
        depend: {
            names: ["type"],
            handle: (val) =>
                of(val).pipe(
                    delay(3000),
                    map(() => [
                        "名字name1",
                        "名字name2",
                        "名字name3",
                        Date.now().toString(),
                    ])
                ),
        },
    },
    {
        name: "name",
        depend: {
            names: ["type"],
            handle: ([name], isChange) => {
                if (isChange.type) {
                    return "";
                }
                return name;
            },
        },
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
                    Name,
                };
            },
            combineType: CombineType.SELF_CHANGE,
        },
    },
];

function App() {
    return (
        <ReForm
            config={RelationConfig}
            style={{ width: 300 }}
            layout="vertical"
            initialValues={{
                name: "名字name2",
                type: "类型type2",
            }}
        >
            <ReField name="Domain" element={Input} label="Domain" />
            <ReField name="App" element={Input} label="App" />
            <ReField
                name="type"
                re-options="typeList"
                element={Select}
                label="typeList"
            />
            <ReField
                name="name"
                re-options="namesList"
                element={Select}
                label="namesList"
            />
            <ReField
                name="confirm"
                label="确认"
                type="button"
                elementProps={{ type: "primary" }}
                element={Button}
            />
        </ReForm>
    );
}

export default App;
