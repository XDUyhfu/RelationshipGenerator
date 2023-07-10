import {IConfigItem} from "@yhfu/re-gen";
import { Input } from "@arco-design/web-react";
import { delay, map, of } from "rxjs";
import { updateReValue } from "./utils";
import { ReContainer } from "./components/re-container";
import { ReField } from "./components/re-field";

const RelationConfig: IConfigItem[] = [
    { name: "input1" },
    { name: "input2", init: "input2" },
    {
        name: "input3",
        init: "123",
        handle(val) {
            updateReValue("range", [val]);
            return val;
        },
    },
    { name: "input4", init: "input4" },
    { name: "input5" },
    {
        name: "show",
        init: false,
        handle: (val) =>
            of(val).pipe(
                delay(5000),
                map(() => true)
            ),
    },
    {
        name: "range",
        init: [],
        depend: {
            names: ["input1"],
            handle([range, input1]) {
                return [...range, input1];
            },
        },
    },
];

function App() {
    return (
        <ReContainer config={RelationConfig} layout={"vertical"}>
            <ReField
                name="input1"
                re-range={"range"}
                re-inject-onChange={"show"}
            >
                <Input
                    // value={"123"}
                    // onChange={(inject, val) => {
                    //     console.log(inject, val);
                    // }}
                />
            </ReField>
            {/*<ReField name="input2" label="这是一个input框" onChange={(va) => {*/}
            {/*    console.log( "logchang", va );*/}
            {/*}}>*/}
            {/*    <Input />*/}
            {/*</ReField>*/}
            {/*<ReField name="input3" value={v} onChange={setV}>*/}
            {/*    <Input />*/}
            {/*</ReField>*/}
            {/*<ReField name="input4" visible={"show"}>*/}
            {/*    <Input />*/}
            {/*</ReField>*/}
        </ReContainer>
    );
}

export default App;
