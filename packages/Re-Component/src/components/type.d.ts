export interface IReContainer {
    children: React.ReactNode;
    config: any[];
}

export interface IReField {
    name: string;
    defaultValue?: any;
    value?: any;
    onChange?: (...args: any[]) => void;
    visible?: boolean | string;
    children: React.ReactElement;
    [`re-${string}`]: string;
}
