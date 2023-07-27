import { useReGen } from "../../../packages/Re-Gen/src/index";
import {
    ParamsConfig,
    ParamsKey,
    RequestConfig,
    RequestKey
} from "./config";
import {
    Button,
    Select
} from "antd";


function App() {
    const { result } = useReGen(RequestKey, RequestConfig);
    const {  ReGenValue: { setValue: setParamsValue } } = useReGen(ParamsKey, ParamsConfig);

    // const { value } = useReGen(SecondCacheKey, SecondConfig);

    return (
        <div>
            {JSON.stringify(result)}
            <br/>
            <Select style={{width: 200}} onChange={setParamsValue("param1")} options={[{label: "XDUyhfu", value: "XDUyhfu"},{label: "p2", value: "p2"}]}></Select>
            <br/>
            <Select style={{width: 200}} onChange={setParamsValue("param2")} options={[{label: "p3", value: "p3"},{label: "p4", value: "p4"}]}></Select>
            <br/>
            <Button onClick={setParamsValue("button")}>发起请求</Button>
        </div>
    );
}

export default App;
