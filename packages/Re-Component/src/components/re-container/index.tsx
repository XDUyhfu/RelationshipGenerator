import { FC } from "react";
import { ReGen } from "@yhfu/re-gen";
import { Atoms$, CacheKey, Config$ } from "../../context/index";
import { IReContainer } from "../type";
import "./index.css";

export const ReContainer: FC<IReContainer> = (props) => {
    const { children, config } = props;
    const AtomInOut = ReGen(CacheKey, config, { logger: true });
    Atoms$.next(AtomInOut);
    Config$.next(config);

    return <div className="re-container">{children}</div>;
};
