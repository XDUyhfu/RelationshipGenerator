import { Select } from "antd";

export const Aggregation = ( { value, change }: { value: string, change: ( ...args: any[] ) => void; } ) => <Select
    allowClear
    style={ { width: 220 } }
    placeholder="Aggregation"
    onChange={ change }
    value={ value }
    options={ [
        { value: "300", label: "5分钟" },
        { value: "600", label: "10分钟" },
        { value: "3600", label: "1小时" },
    ] }
/>;