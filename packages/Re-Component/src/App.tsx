import {
    IConfigItem,
    setValue
} from "@yhfu/re-gen";
import {
    Input,
    Select
} from "@arco-design/web-react";
import { delay, map, of } from "rxjs";
import { ReContainer } from "./components/re-container";
import { ReField } from "./components/re-field";
import { TestComponent } from "./TestComponent";
import { CacheKey } from "./context";

const RelationConfig: IConfigItem[] = [
    { name: "input1" },
    { name: "input2", init: "input2" },
    {
        name: "input3",
        init: "123",
        handle(val) {
            setValue(CacheKey,"range", [val]);
            return val;
        },
    },
    { name: "input4" },
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
        }
    },
];

function App() {
    return (
        <ReContainer config={RelationConfig} layout={"vertical"}>
            <ReField
                name="input1"
                re-range={"range"}
                // re-inject-onChange={"show"}
                // onChange={() => {
                //     console.log( getValue( CacheKey, "show" ) );
                // }}
                element={Input}
                label={"input1"}
                style={{width: 300}}
            />
            <ReField name={"input2"} re-vv={"input1"} element={TestComponent} label={"input2"} style={{width: 300}} />
            <ReField name="input4" label={"input2"} element={Select} elementProps={{options: [{label: "label", value: "value"}]}} />
        </ReContainer>
    );
}

export default App;
