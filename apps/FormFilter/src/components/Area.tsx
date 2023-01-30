import { Select } from "antd";
export const Area = ( { value, change }: { value: string, change: ( ...args: any[] ) => void; } ) => <Select
    allowClear
    style={ { width: 220 } }
    placeholder="area"
    value={ value }
    onChange={ change }
    options={ [
        { value: "CN", label: "中国大陆" },
        { value: "AP1", label: "亚太1区" },
        { value: "AP2", label: "亚太2区" },
        { value: "Oversea", label: "海外大区" },
    ] }
/>;