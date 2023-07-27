import { Form, FormProps } from "@arco-design/web-react";
import type { FC } from "react";
import { ReGen } from "@yhfu/re-gen";
import {
    CacheKey,
    ReFormContext
} from "../../context";
import { IRelationConfig } from "@yhfu/re-gen/src";

interface IReForm {
    config: IRelationConfig,
    initialValues?: Record<string, any>
}

export const ReForm: FC<Omit<FormProps, "initialValues"> & IReForm> = (props) => {
    const {config, children, initialValues, ...rest} = props;
    ReGen(CacheKey, config, { logger: true });
    return <ReFormContext.Provider value={initialValues ?? {}}>
        <Form {...rest}>{children}</Form>
    </ReFormContext.Provider>;
};
