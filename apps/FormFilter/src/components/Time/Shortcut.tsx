import { Radio } from "antd";

export const Shortcut = ( { value, change }: { value: string, change: ( ...args: any[] ) => void; } ) => <Radio.Group
    onChange={ change }
    value={ value }
>
    <Radio.Button value="600">10分钟</Radio.Button>
    <Radio.Button value="3600">1小时</Radio.Button>
    <Radio.Button value="86400">1天</Radio.Button>
</Radio.Group>;
