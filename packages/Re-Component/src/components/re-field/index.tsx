import { cloneElement } from "react";
import {  CacheKey } from "../../context/index";
import { SetAtomValueByKey } from "@yhfu/re-gen";
import { IReField } from "../type";
import { useAtom, useRestProps, useVisible } from "../../hook";

export const ReField = ( props: IReField) => {
    
    const { name, defaultValue, children, onChange, value, visible = true, ...rest } = props;
    const [val, callback] = useAtom( name );
    const restProps = useRestProps(rest);
    const isShow = useVisible(visible);

    return (
        <span>
            {isShow ? cloneElement(children, {
                value: value ?? val ?? defaultValue,
                onChange: onChange
                    ? (...vals: any[]) => {
                          onChange(SetAtomValueByKey(CacheKey), ...vals);
                      }
                    : callback,
                    ...restProps
            }) : null}
        </span>
    );
};
