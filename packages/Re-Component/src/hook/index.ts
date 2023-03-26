import { useObservable } from "rxjs-hooks";
import { Atoms$, Config$, ReValues } from "../context";
import { distinctUntilChanged, filter, isObservable } from "rxjs";
import { useCallback } from "react";
import { equals } from "ramda";

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

export const useRestProps = (
    props: Record<string, string>,
    children: React.ReactElement
) => {
    // const propsWithReInject = handleReInject();

    const propsWithoutReInject = {} as Record<string, any>;
    Object.keys(props).map((item) => {
        if (item.startsWith("re-inject-")) {
            const propName = item.replace("re-inject-", "") as string;
            if (!(propName.length > 0)) {
                throw Error("无效的 re-inject-* 属性");
            }
            if (typeof children.props[propName] !== "function") {
                throw Error("re-inject-* 属性只能用于函数属性");
            }
            const value = useAtom(props[item])[0];
            console.log(value);
            propsWithoutReInject[propName] = useCallback(
                (...args: any[]) => {
                    children.props[propName](value, ...args);
                },
                [value]
            );
        } else {
            propsWithoutReInject[item] = props[item];
        }
    });

    const restPropsWithRe = {} as Record<string, any>;
    Object.keys(propsWithoutReInject).map((item) => {
        if (item.startsWith("re-")) {
            restPropsWithRe[`${item.slice(3)}`] = useAtom(
                (propsWithoutReInject as Record<string, string>)[item]
            )[0];
        }
    });
    const restPropsWithoutRe = {} as Record<string, any>;
    Object.keys(propsWithoutReInject).map((item) => {
        if (!item.startsWith("re-")) {
            restPropsWithoutRe[item] = (
                propsWithoutReInject as Record<string, string>
            )[item];
        }
    });
    return { ...restPropsWithoutRe, ...restPropsWithRe };
};

export const useVisible = (visible: boolean | string) =>
    typeof visible === "string" ? useAtom(visible)[0] : visible;

export const useReValues = (): Record<string, any> =>
    useObservable(
        () => ReValues.pipe(distinctUntilChanged(equals)),
        {}
    ) as Record<string, any>;
