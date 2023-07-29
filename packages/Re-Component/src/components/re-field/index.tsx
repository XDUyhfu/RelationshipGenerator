import React, {
    createElement,
    FC,
    ReactElement,
} from "react";
import {
    useInitValue,
    useRestProps,
    useReValue,
    useVisible
} from "../../hook";
import {
    Form,
    FormItemProps
} from "@arco-design/web-react";

export interface IReField {
    name: string;
    value?: any;
    onChange?: (...args: any[]) => void;
    visible?: boolean | string;
    element?: FC<any>;
    elementProps?: Record<string, any>,
    [x: `re-${string}`]: string
    [x: `re-inject-${string}`]: string
}

const DefaultComponent = ({value}: {value: ReactElement}) => <>{value}</>;

export const ReField = (props: Omit<FormItemProps, "field" | "initialValue" | "defaultValue"> & IReField) => {
    const {
        name,
        element,
        onChange,
        value,
        visible = true,
        elementProps,
        ...rest
    } = props;

    useInitValue(name);
    const [reValue, setReValue] = useReValue(name);
    const [reProps, withoutReProps] = useRestProps(rest);
    const isShow = useVisible(visible);
    let finalValue;
    try{
        finalValue = element ? (value ?? reValue) : JSON.stringify(value ?? reValue);
    } catch ( e ) {
        console.error("value 无法被序列化显示");
    }

    return isShow ? (
        <Form.Item {...withoutReProps}>
            {
                createElement( element ?? DefaultComponent, {
                    value: finalValue,  // 这个地方得判断是否传入完全了 value 和 onChange
                    onChange: ( ...args: any[] ) => {
                        onChange?.( ...args );
                        !value && setReValue( ...args );
                    },
                    ...elementProps,
                    ...reProps
                } )
            }
        </Form.Item>
    ) : null;
};
