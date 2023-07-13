import { IConfigItem } from "@yhfu/re-gen";

export interface ReComponentOptions {
    rewriteOrExpendConfig?: Array<
        Partial<Omit<IConfigItem, "name">> & { name: string }
    >;
    logger?: boolean;
}
