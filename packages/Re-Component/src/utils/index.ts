import React, { isValidElement } from "react";
import { compose, difference, map, pluck } from "ramda";
import { IConfigItem } from "@yhfu/re-gen";

export const mergeConfigAndReactChildren = (
    children: React.ReactNode,
    config: IConfigItem[]
): IConfigItem[] => {
    if (isValidReChildren(children)) {
        const names = React.Children.map(children, (node) => {
            if (node?.props?.name) {
                return node.props.name;
            }
        });
        const withoutConfig = compose(
            map((name) => ({ name })),
            difference(names),
            pluck("name")
        ) as (config: IConfigItem[]) => IConfigItem[];

        return [...config, ...withoutConfig(config)];
    } else {
        throw Error("无效的 children");
    }
};

const isValidReChildren = (
    children: React.ReactNode
): children is React.ReactElement<
    any,
    string | React.JSXElementConstructor<any>
> => {
    if (children && typeof children === "object" && Array.isArray(children)) {
        React.Children.map(
            children,
            (
                node: React.ReactElement<
                    unknown,
                    string | React.JSXElementConstructor<any>
                >
            ) => {
                if (isValidElement(node)) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (node?.type?.name !== "ReField") {
                        return false;
                    }
                }
            }
        );
        return true;
    }
    return false;
};
