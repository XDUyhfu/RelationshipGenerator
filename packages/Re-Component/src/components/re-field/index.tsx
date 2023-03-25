import { cloneElement, useEffect } from "react";
import { CacheKey, ReValue } from "../../context/index";
import { GetAtomValues, SetAtomValueByKey } from "@yhfu/re-gen";
import { IReField } from "../type.d";
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
    const restProps = useRestProps(rest);
    const isShow = useVisible(visible);

    useEffect(() => {
        ReValue.next(GetAtomValues(CacheKey));
    }, [val]);

    return (
        <span>
            {isShow
                ? cloneElement(children, {
                      value: value ?? val ?? defaultValue,
                      onChange: onChange
                          ? (...vals: any[]) => {
                                onChange(SetAtomValueByKey(CacheKey), ...vals);
                            }
                          : callback,
                      ...restProps,
                  })
                : null}
        </span>
    );
};
