import { FC } from "react";
import { IReContainer } from "../type.d";
import "./index.css";

export const ReContainer: FC<IReContainer> = (props) => {
    const { children } = props;


    return <div className="re-container">{children}</div>;
};
