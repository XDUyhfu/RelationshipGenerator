import React, {
    cloneElement,
    createElement,
    FC
} from "react";
import {
    // useRestProps,
    useReValue,
    useVisible
} from "../../hook";
import { Form, FormItemProps } from "@arco-design/web-react";

export interface IReField {
    name: string;
    value?: any;
    onChange?: (...args: any[]) => void;
    visible?: boolean | string;
    element: FC<any>;
    [x: `re-${string}`]: string
    [x: `re-inject-${string}`]: string
}

export const ReField = (props: Omit<FormItemProps, "field" | "initialValue" | "defaultValue"> & IReField) => {
    const {
        name,
        element,
        onChange,
        value,
        visible = true,
        ...rest
    } = props;

    const [reValue, setReValue] = useReValue(name);
    // const restProps = useRestProps(rest, element);
    const isShow = useVisible(visible);

    return isShow ? (
        <Form.Item {...rest}>
            {
                createElement( element, {
                    value: value ?? reValue, // 这个地方得判断是否传入完全了 value 和 onChange
                    onChange: ( ...args: any[] ) => {
                        onChange?.( ...args );
                        !value && setReValue( ...args );
                    }
                } )
            }
        </Form.Item>
    ) : null;
};
