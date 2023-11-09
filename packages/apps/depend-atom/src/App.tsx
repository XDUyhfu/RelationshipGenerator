import { useReGen } from "../../../Re-Gen/src/hooks/react/index";
import { ParamsConfig, ParamsKey, RequestConfig, RequestKey } from "./config";
import { Button, Select } from "antd";

function App() {
    const { result } = useReGen(RequestKey, RequestConfig);
    const {
        param1,
        ReGenValue: { setValue: setParamsValue },
    } = useReGen(ParamsKey, ParamsConfig as any);

    return (
        <div>
            {JSON.stringify(result?.data?.result?.login)}
            <br />
            <Select
                style={{ width: 200 }}
                value={param1}
                onChange={setParamsValue("param1")}
                options={[
                    { label: "XDUyhfu", value: "XDUyhfu" },
                    { label: "p2", value: "p2" },
                ]}
            ></Select>
            <br />
            <Select
                style={{ width: 200 }}
                onChange={setParamsValue("param2")}
                options={[
                    { label: "p3", value: "p3" },
                    { label: "p4", value: "p4" },
                ]}
            ></Select>
            <br />
            <Button onClick={setParamsValue("button")}>发起请求</Button>
        </div>
    );
}

export default App;
