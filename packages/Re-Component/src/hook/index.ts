import { useObservable } from "rxjs-hooks";
import { Atoms$, Config$ } from "../context";
import { filter, isObservable } from "rxjs";
import { useCallback } from "react";

export const useAtom = (name: string) => {
    const inout = Atoms$?.getValue()(name);
    const config = Config$.getValue();
    if (!inout[`${name}In$`]) {
        throw Error(`配置对象数组中没有 name 属性为 ${name} 的对象`);
    }
    const callback = useCallback(
        (val: any) => inout[`${name}In$`].next(val),
        []
    );
    const val = useObservable(
        () => inout[`${name}Out$`].pipe(filter((item) => !isObservable(item))),
        config.filter((item) => item.name === name)[0].init
    );
    return [val, callback];
};

export const useRestProps = (props: Record<string, string>) => {
    const restPropsWithRe = {} as Record<string, any>;
    Object.keys(props).map((item) => {
        if (item.startsWith("re-")) {
            restPropsWithRe[`${item.slice(3)}`] = useAtom(
                (props as Record<string, string>)[item]
            )[0];
        }
    });
    const restPropsWithoutRe = {} as Record<string, any>;
    Object.keys(props).map((item) => {
        if (!item.startsWith("re-")) {
            restPropsWithoutRe[item] = (props as Record<string, string>)[item];
        }
    });
    return { ...restPropsWithoutRe, ...restPropsWithRe };
};

export const useVisible = (visible: boolean | string) =>
    typeof visible === "string" ? useAtom(visible)[0] : visible;
