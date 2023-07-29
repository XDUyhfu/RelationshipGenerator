import React, { createElement, FC, ReactElement } from "react";
import { useRestProps, useReValue, useVisible } from "../../hook";
import { Form, FormItemProps } from "@arco-design/web-react";

export interface IReField {
    name: string;
    value?: any;
    type?: "button";
    onChange?: (...args: any[]) => void;
    onClick?: (...args: any[]) => void;
    visible?: boolean | string;
    element?: FC<any>;
    elementProps?: Record<string, any>;
    label?: string;
    [x: `re-${string}`]: string;
    [x: `re-inject-${string}`]: string;
}

const DefaultComponent = ({ value }: { value: ReactElement }) => <>{value}</>;

export const ReField = (
    props: Omit<
        FormItemProps,
        "field" | "initialValue" | "defaultValue" | "label"
    > &
        IReField
) => {
    const {
        name,
        element,
        onChange,
        onClick,
        value,
        visible = true,
        elementProps,
        type,
        label,
        ...rest
    } = props;

    const [reValue, setReValue] = useReValue(name);
    const [reProps, withoutReProps] = useRestProps(rest);
    const isShow = useVisible(visible);
    let finalValue;
    try {
        finalValue = element
            ? value ?? reValue
            : JSON.stringify(value ?? reValue);
    } catch (e) {
        throw new Error("value 无法被序列化显示");
    }

    const finalProps = {
        value: finalValue, // 这个地方得判断是否传入完全了 value 和 onChange
        onChange: (...args: any[]) => {
            onChange?.(...args);
            !value && setReValue(...args);
        },
        ...elementProps,
        ...reProps,
    };
    const finalPropsWithOnClick = {
        ...finalProps,
        children: label,
        onClick: (...args: any[]) => {
            onClick?.(...args);
        },
    };

    return isShow ? (
        <Form.Item {...withoutReProps} label={type === "button" ? "" : label}>
            {createElement(
                element ?? DefaultComponent,
                type === "button" ? finalPropsWithOnClick : finalProps
            )}
        </Form.Item>
    ) : null;
};
