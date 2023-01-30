import { Input } from "antd";

export const IP = ( { value, change }: { value: string, change: ( ...args: any[] ) => void; } ) => <Input placeholder="ip" value={ value } onChange={ change } />;