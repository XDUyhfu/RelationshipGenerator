import { Select } from "antd";

export const Domain = ( { value, change }: { value: string[], change: ( ...args: any[] ) => void; } ) => <Select
    mode="multiple"
    allowClear
    style={ { width: 220 } }
    placeholder="domain"
    maxTagCount={ 1 }
    onChange={ change }
    value={ value }
    options={ [
        { value: "1.test.pull.com", label: "1.test.pull.com" },
        { value: "2.test.pull.com", label: "2.test.pull.com" },
        { value: "3.test.pull.com", label: "3.test.pull.com" },
        { value: "4.test.pull.com", label: "4.test.pull.com" },
    ] }
/>;