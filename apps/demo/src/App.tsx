import { useReGen } from "../../../packages/Re-Gen/src/index";
import { RelationConfig, RelationConfig2 } from "./config";
import {
    Button,
    Select
} from "antd";

function App() {
    const {
            RelationConfig: {
                area,region,showRegion,RegionList,testMoreDepend,
            ReGenValue: {setValue}
        }
} = useReGen("CACHE_KEY", {
        RelationConfig,
        RelationConfig2
    }, { logger: true });

    return (
        <div>
            <div>areaValue: {JSON.stringify(area)}</div>
            <div>regionValue: {JSON.stringify(region)}</div>
            <div>showRegionValue: {JSON.stringify(showRegion)}</div>
            <div>RegionListValue: {JSON.stringify(RegionList)}</div>
            <div>testMoreDependValue: {JSON.stringify(testMoreDepend)}</div>
            <div>

            </div>

            <br />

            <Select
                style={{ width: 120 }}
                onChange={(val) => {
                    setValue("area", Promise.resolve(val));
                }}
                value={area}
                placeholder="area"
                options={[
                    {
                        value: "AP1",
                        label: "亚太1区",
                    },
                    {
                        value: "AP2",
                        label: "亚太2区",
                    },
                    {
                        value: "CN",
                        label: "中国大陆",
                    },
                ]}
            />

            <br />

            {showRegion ? (
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: 120 }}
                    placeholder="region"
                    onChange={setValue("region")}
                    options={[
                        {
                            value: "BJ",
                            label: "北京",
                        },
                        {
                            value: "SH",
                            label: "上海",
                        },
                        {
                            value: "GZ",
                            label: "广州",
                        },
                        {
                            value: "SZ",
                            label: "深圳",
                        },
                    ]}
                />
            ) : null}

            <br />
            <br />
            <Button
                type="primary"
                onClick={() => {
                    // console.log(GetAtomValues("CACHE_KEY"));
                }}
            >
                获取最新值
            </Button>
        </div>
    );
}

export default App;
