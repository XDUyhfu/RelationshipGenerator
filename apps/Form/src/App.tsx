import { ReGen } from "../../../packages/Re-Gen/src/index";

import React from "react";
import { ConfigItems, IItem } from "./config";
import { useAtomsValue, useAtomsCallback } from "@yhfu/re-gen-hooks";
import { Button, Input, Select, Space } from "antd";

const AtomInOut = ReGen("FORM_CACHE_KEY", ConfigItems, {logger: true,});

const App: React.FC = () => {
    const { Items, ItemNames } = useAtomsValue(AtomInOut, ConfigItems);
    const { addItemCallback, nameCallback } = useAtomsCallback(
        AtomInOut,
        ConfigItems
    );

    return (
        <div>
            {JSON.stringify(Items)}
            <br />
            {JSON.stringify(ItemNames)}
            <br />

            <Button onClick={addItemCallback}>添加</Button>
            <br />
            <br />
            {Items?.filter((val: any) => val).map((item: IItem) => (
                <Space style={{ marginTop: 10 }} key={item?.id}>
                    <Input
                        style={{ width: 160 }}
                        onChange={(value) => {
                            nameCallback({
                                value: value.target.value,
                                id: item.id,
                            });
                        }}
                        value={item?.name}
                        placeholder="name"
                    />
                    <Input style={{ width: 160 }} placeholder="init" />
                    <Input style={{ width: 160 }} placeholder="function" />
                    <Select
                        mode="multiple"
                        style={{ width: 160 }}
                        maxTagCount={1}
                        options={ItemNames?.filter(
                            (inner: string) => item?.name !== inner
                        )?.map((inner: string) => ({
                            label: inner,
                            value: inner,
                        }))}
                    />
                    <Input style={{ width: 160 }} placeholder="function" />
                </Space>
            ))}
        </div>
    );
};

export default App;
