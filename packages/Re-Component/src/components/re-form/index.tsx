import { Form, FormProps } from "@arco-design/web-react";
import type {
    FC,
    JSXElementConstructor,
    ReactElement,
} from "react";
import {
    IConfigItem,
    ReGen
} from "@yhfu/re-gen";
import {
    CacheKey,
    ReFormContext
} from "../../context";
import React from "react";
import {
    compose,
    difference,
    pluck,
    map
} from "ramda";

interface IReForm {
    config: IConfigItem[],
    initialValues?: Record<string, any>
}

export const ReForm: FC<Omit<FormProps, "initialValues"> & IReForm> = (props) => {
    const {config, children, initialValues, ...rest} = props;
    const names = React.Children.map(children, (node) => {
        if ((node as ReactElement<any, string | JSXElementConstructor<any>>)?.props?.name) {
            return (node as ReactElement<any, string | JSXElementConstructor<any>>).props.name;
        }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const withoutConfig = compose(map(name => ({name})), difference(names), pluck("name")) as (config: IConfigItem[]) => IConfigItem[];

    ReGen(CacheKey, [...config, ...withoutConfig(config)], { logger: true, init: initialValues });
    return <ReFormContext.Provider value={initialValues ?? {}}>
        <Form {...rest}>{children}</Form>
    </ReFormContext.Provider>;
};
