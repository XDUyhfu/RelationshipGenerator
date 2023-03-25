// import { Domain } from "./components/Domain";
// import { Shortcut } from "./components/Time/Shortcut";
// import { Time } from "./components/Time/Time";
// import { Aggregation } from "./components/Time/Aggregation";
// import { Area } from "./components/Area";
// import { Region } from "./components/Region";
// import { IP } from "./components/IP";
// import styled from "styled-components";
import {
    // Button,
    Input,
    // Space, Tabs
} from "antd";
// import { ReGen,useAtomsValue, useAtomsCallback } from "../../../packages/Re-Gen/src/index";
import {
    // CacheKey,
    RelationConfig,
    // TabItems
} from "./config";

import { ReComponent } from "@yhfu/re-component";

// const Wrapper = styled(Space)`
//     display: flex;
//     flex-wrap: wrap;
//     margin: 16px 0;

//     > * {
//         margin-bottom: 10px;
//     }
// `;

// const AtomInOut = ReGen(CacheKey, RelationConfig, { logger: true });

const  {useReValue, ReContainer, ReField } = ReComponent(RelationConfig);

function App () {
    const value = useReValue();
    console.log("useRCValue",value);

    // const {
    //     domain,
    //     time,
    //     shortcut,
    //     aggregation,
    //     area,
    //     region,
    //     regionShow,
    //     RegionList,
    //     SelectableTimeRange,
    //     tab,
    //     areaShow,
    //     confirm,
    // } = useAtomsValue(CacheKey, AtomInOut);

    // const {
    //     domainCallback,
    //     timeCallback,
    //     shortcutCallback,
    //     areaCallback,
    //     regionCallback,
    //     aggregationCallback,
    //     tabCallback,
    //     confirmCallback,
    // } = useAtomsCallback(CacheKey, AtomInOut);

    return (
        <>
            <ReContainer config={RelationConfig}>
                <ReField name="areaShow">
                    <Input></Input>
                </ReField>
                <ReField name="areaShow">
                    <Input></Input>
                </ReField>
            </ReContainer>
            {/* <Tabs
                activeKey={tab as string}
                items={TabItems}
                onChange={tabCallback}
            /> */}
            {/* <Wrapper>
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
                        // shortcutCallback(0);
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
                    确认
                </Button>
            </Wrapper> */}
            <br />
            <br />
            {/* <div>RegionListValue: {JSON.stringify(RegionList)}</div> */}

            <br />
            <br />
            {/* <div>{JSON.stringify(confirm)}</div> */}
        </>
    );
}

export default App;
