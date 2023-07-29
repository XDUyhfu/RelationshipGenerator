import React from "react";
import { Form, FormProps } from "@arco-design/web-react";
import type { FC } from "react";
import { IConfigItem, ReGen } from "@yhfu/re-gen";
import { CacheKey, ReFormContext } from "../../context";
import { mergeConfigAndReactChildren } from "../../utils";

interface IReForm {
    config: IConfigItem[];
    initialValues?: Record<string, any>;
}

export const ReForm: FC<Omit<FormProps, "initialValues"> & IReForm> = (
    props
) => {
    const { config, children, initialValues, ...rest } = props;
    const newConfig = mergeConfigAndReactChildren(children, config);
    ReGen(CacheKey, newConfig, {
        logger: true,
        init: initialValues,
    });

    return (
        <ReFormContext.Provider value={initialValues ?? {}}>
            <Form {...rest}>{children}</Form>
        </ReFormContext.Provider>
    );
};
