import {
    useAtomsCallback,
    useAtomsValue,
    // ReGenRegisterConfig
} from "../../../packages/Re-Gen/src/index";
import { RelationConfig } from "./config";
import { Button, Select } from "antd";


function App() {
    // ReGenRegisterConfig("CACHE_KEY", {logger: true});
    const {
        area,
        region,
        showRegion,
        RegionList,
        testMoreDepend,
        testMoreMoreDepend,
    } = useAtomsValue("CACHE_KEY", RelationConfig);
    const { areaCallback, regionCallback } = useAtomsCallback("CACHE_KEY", RelationConfig );

    return (
        <div>
            <div>areaValue: {JSON.stringify(area)}</div>
            <div>regionValue: {JSON.stringify(region)}</div>
            <div>showRegionValue: {JSON.stringify(showRegion)}</div>
            <div>RegionListValue: {JSON.stringify(RegionList)}</div>
            <div>testMoreDependValue: {JSON.stringify(testMoreDepend)}</div>
            <div>
                testMoreMoreDependValue: {JSON.stringify(testMoreMoreDepend)}
            </div>

            <br />

            <Select
                style={{ width: 120 }}
                onChange={(val) => {
                    areaCallback(Promise.resolve(val));
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
                    onChange={regionCallback}
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

            {/*<br />*/}
            {/*<br />*/}
            {/*<div>{JSON.stringify(confirm)}</div>*/}
            {/*<Button type="primary" onClick={confirmCallback}>*/}
            {/*    confirm*/}
            {/*</Button>*/}
        </div>
    );
}

export default App;
