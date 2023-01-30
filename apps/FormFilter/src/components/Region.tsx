import { Select } from "antd";
export const Region = ( { value, change }: { value: string[], change: ( ...args: any[] ) => void; } ) => <Select
    mode="multiple"
    allowClear
    style={ { width: 220 } }
    placeholder="region"
    maxTagCount={ 2 }
    onChange={ change }
    value={ value }
    options={ [
        { value: "BJ", label: "北京" },
        { value: "SH", label: "上海" },
        { value: "NJ", label: "南京" },
        { value: "HN", label: "河南" },
    ] }
/>;