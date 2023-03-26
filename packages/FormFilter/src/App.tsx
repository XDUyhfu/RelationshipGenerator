import { updateReValue } from "@yhfu/re-component";
import FilterComponent from "./FilterComponent";
import { TabItems } from "./config";
import { Tabs } from "@arco-design/web-react";
import { Other } from "./other";

export const App = () => (
    <div>
        <Tabs
            onChange={(val) => {
                updateReValue("tab", val);
            }}
        >
            {TabItems.map((item) => (
                <Tabs.TabPane key={item.key} title={item.title}></Tabs.TabPane>
            ))}
        </Tabs>
        <FilterComponent></FilterComponent>
        <Other></Other>
    </div>
);
