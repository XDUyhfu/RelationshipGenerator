import { Radio, Select, DatePicker, Input } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import "./index.css";
import {
    AggregationOption,
    AreaOption,
    DomainOption,
    OperatorOption,
    ProtocalOption,
    RegionOption,
    RelationConfig,
    ShortcutOption,
} from "./config";

import { ReComponent, ReContainer, ReField } from "@yhfu/re-component";
ReComponent(RelationConfig, {
    logger: true,
    rewriteOrExpendConfig: [],
});
import dayjs from "dayjs";
import { DateFormat } from "./config";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

function FilterComponent() {
    return (
        <>
            <ReContainer>
                <ReField name="domain">
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: 220 }}
                        placeholder="域名"
                        maxTagCount={1}
                        options={DomainOption}
                    />
                </ReField>
                <ReField name="shortcut">
                    <Radio.Group type="button">
                        {ShortcutOption.map((item) => (
                            <Radio key={item.value} value={item.value}>
                                {item.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                </ReField>
                <ReField
                    name="time"
                    re-inject-disabledDate="SelectableTimeRange"
                >
                    <RangePicker
                        showTime
                        format={DateFormat}
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        //@ts-ignore
                        disabledDate={(SelectableTimeRange, date) =>
                            !date.isBetween(
                                SelectableTimeRange?.[0],
                                SelectableTimeRange?.[1]
                            )
                        }
                    />
                </ReField>
                <ReField name="aggregation">
                    <Select
                        allowClear
                        style={{ width: 220 }}
                        placeholder="Aggregation"
                        options={AggregationOption}
                    />
                </ReField>
                <ReField name="protocal">
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: 220 }}
                        placeholder="选择协议"
                        maxTagCount={2}
                        options={ProtocalOption}
                    />
                </ReField>
                <ReField name="area" visible="areaShow">
                    <Select
                        allowClear
                        style={{ width: 220 }}
                        placeholder="选择大区"
                        options={AreaOption}
                    />
                </ReField>
                <ReField name="region" visible="regionShow">
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: 220 }}
                        placeholder="region"
                        maxTagCount={2}
                        options={RegionOption}
                    />
                </ReField>
                <ReField name="operator">
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: 220 }}
                        placeholder="运营商"
                        maxTagCount={2}
                        options={OperatorOption}
                    />
                </ReField>
                <ReField name="ip">
                    <Input style={{ width: 500 }} placeholder="请输入IP" />
                </ReField>
            </ReContainer>

            <br />
            <br />

            <br />
            <br />
        </>
    );
}

export default FilterComponent;
