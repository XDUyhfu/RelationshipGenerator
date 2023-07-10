import React, { cloneElement } from "react";
import {
    useRestProps,
    useReValue,
    useVisible
} from "../../hook";
import { Form, FormItemProps } from "@arco-design/web-react";

export interface IReField {
    name: string;
    value?: any;
    onChange?: (...args: any[]) => void;
    visible?: boolean | string;
    children: React.ReactElement;
}

export const ReField = (props: Omit<FormItemProps, "field" | "initialValue" | "defaultValue"> & IReField) => {
    const {
        name,
        children,
        onChange,
        value,
        visible = true,
        ...rest
    } = props;

    const [reValue, setReValue] = useReValue(name);
    const restProps = useRestProps(rest, children);
    const isShow = useVisible(visible);

    return isShow ? (
        <Form.Item {...restProps}>
            {cloneElement(children, {
                value: value ?? reValue,
                // 这个地方得判断是否传入完全了 value 和 onChange
                onChange: (...args: any[]) => {
                    console.log("...args", ...args);
                    onChange?.(...args);
                    !value && setReValue(...args);
                }
            })}
        </Form.Item>
    ) : null;
};
