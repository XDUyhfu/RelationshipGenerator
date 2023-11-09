import { Tabs } from "antd";
import App from "./App.tsx";

export const Test = () => {
    const items = [
        {
            key: "1",
            label: "Tab 1",
            children: <App />,
        },
        {
            key: "2",
            label: "Tab 2",
            children: "Content of Tab Pane 2",
        },
    ];
    return <Tabs defaultActiveKey="1" items={items} destroyInactiveTabPane />;
};
