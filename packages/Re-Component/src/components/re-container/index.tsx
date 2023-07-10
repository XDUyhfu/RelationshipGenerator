import { Form, FormProps } from "@arco-design/web-react";
import type { FC } from "react";
import {
    IConfigItem,
    ReGen,
} from "@yhfu/re-gen";
import { CacheKey } from "../../context";

interface IReContainer {
    config: IConfigItem[]
}

export const ReContainer: FC<FormProps & IReContainer> = (props) => {
    const {config, children, ...rest} = props;
    ReGen(CacheKey, config, {logger: true});
    return <Form {...rest}>{children}</Form>;
};
