import { FC, cloneElement, useCallback } from "react";
import { useObservable } from "rxjs-hooks";
import { filter, isObservable } from "rxjs";
import {  Atoms$, CacheKey  } from "../../context/index";
import { SetAtomValueByKey } from "@yhfu/re-gen";

interface IReField {
    name: string,
    defaultValue?: any
    value?: any
    onChange?: ( ...args: any[] ) => void,
    children: React.ReactElement,
}

export const ReField: FC<IReField> = ( props ) => {
    if (!Atoms$ ?.getValue()) { return null; } 
    const { name,defaultValue, children,onChange, value } = props;
    const inout$ = Atoms$ ?.getValue()( name );
  
    const val = useObservable(
        () =>
            inout$[`${name}Out$`].pipe(
                filter((item) => !isObservable(item))
            ),
    );

    const callback = useCallback(
        (val: any) => inout$[`${name}In$`].next(val),
        []
    );

    return <span>
        { cloneElement( children, {
            value: value ?? val ?? defaultValue,
            onChange: onChange ? ( ...vals: any[] ) => { 
                console.log(123);
                onChange(SetAtomValueByKey(CacheKey), ...vals);
            } : callback
        })}
    </span>;
};