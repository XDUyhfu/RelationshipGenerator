import { IConfigItem } from "@yhfu/re-gen";

export interface IReContainer {
    children: React.ReactNode;
}

export interface IReField {
    name: string;
    defaultValue?: any;
    value?: any;
    onChange?: (...args: any[]) => void;
    visible?: boolean | string;
    children: React.ReactElement;
}

export interface ReComponentOptions {
    rewriteOrExpendConfig?: Array<
        Partial<Omit<IConfigItem, "name">> & { name: string }
    >;
    logger?: boolean;
}
