import { Domain } from "./components/Domain";
import { Shortcut } from "./components/Time/Shortcut";
import { Time } from "./components/Time/Time";
import { Aggregation } from "./components/Time/Aggregation";
import { Area } from "./components/Area";
import { Region } from "./components/Region";
import { IP } from "./components/IP";
import styled from "styled-components";
import { Button, Space, Tabs } from "antd";
import { ReGen } from "../../../packages/Re-Gen/src/index";
import { CacheKey, RelationConfig, TabItems } from "./config";
import { useAtomsValue, useAtomsCallback } from "@yhfu/re-gen-hooks";

const Wrapper = styled(Space)`
    display: flex;
    flex-wrap: wrap;
    margin: 16px 0;

    > * {
        margin-bottom: 10px;
    }
`;

const AtomInOut = ReGen(CacheKey, RelationConfig, { logger: true });

function App() {
    const {
        domain,
        time,
        shortcut,
        aggregation,
        area,
        region,
        regionShow,
        RegionList,
        SelectableTimeRange,
        tab,
        areaShow,
        confirm,
    } = useAtomsValue(AtomInOut, RelationConfig);

    const {
        domainCallback,
        timeCallback,
        shortcutCallback,
        areaCallback,
        regionCallback,
        aggregationCallback,
        tabCallback,
        confirmCallback,
    } = useAtomsCallback(AtomInOut, RelationConfig);

    return (
        <>
            <Tabs
                activeKey={tab as string}
                items={TabItems}
                onChange={tabCallback}
            />
            <Wrapper>
                <Domain value={domain as string[]} change={domainCallback} />
                <Shortcut
                    value={shortcut as string}
                    change={(shortcut) => {
                        shortcutCallback(shortcut.target.value);
                    }}
                />
                <Time
                    value={time as string[]}
                    change={(_, time: string[]) => {
                        timeCallback(time);
                        shortcutCallback(0);
                    }}
                    range={SelectableTimeRange as string[]}
                />
                <Aggregation
                    value={aggregation as string}
                    change={aggregationCallback}
                />
                {areaShow ? (
                    <Area value={area as string} change={areaCallback} />
                ) : null}
                {regionShow ? (
                    <Region
                        value={region as string[]}
                        change={regionCallback}
                    />
                ) : null}
                <IP value={domain as string} change={domainCallback} />
                <Button type="primary" onClick={confirmCallback}>
                    ??????
                </Button>
            </Wrapper>
            <br />
            <br />
            <div>RegionListValue: {JSON.stringify(RegionList)}</div>

            <br />
            <br />
            <div>{JSON.stringify(confirm)}</div>
        </>
    );
}

export default App;
