import { cloneElement, useEffect } from "react";
import { CacheKey, ReValues } from "../../context/index";
import { GetAtomValues, SetAtomValueByKey } from "@yhfu/re-gen";
import { IReField } from "../../type";
import { useAtom, useRestProps, useVisible } from "../../hook";

export const ReField = (props: IReField) => {
    const {
        name,
        defaultValue,
        children,
        onChange,
        value,
        visible = true,
        ...rest
    } = props;
    const [val, callback] = useAtom(name);
    const restProps = useRestProps(rest, children);
    const isShow = useVisible(visible);

    useEffect(() => {
        ReValues.next(GetAtomValues(CacheKey));
    }, [val]);

    return isShow ? (
        <span>
            {cloneElement(children, {
                value: value ?? val ?? defaultValue,
                onChange: onChange
                    ? (...vals: any[]) => {
                          onChange(SetAtomValueByKey(CacheKey), ...vals);
                      }
                    : callback,
                ...restProps,
            })}
        </span>
    ) : null;
};
