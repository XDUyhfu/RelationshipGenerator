import { FC } from "react";
import { Space } from "@arco-design/web-react";
import styled from "styled-components"; 
import { ReGen } from "@yhfu/re-gen";
import {  Atoms$, CacheKey  } from "../../context/index";

const Container = styled(Space)`
    display: flex;
    flex-wrap: wrap;
    margin: 16px 0;

    > * {
        margin-bottom: 10px;
    }
`;

interface IReContainer {
    children:  React.ReactNode,
    config: any[]
}

export const ReContainer: FC<IReContainer> = ( props ) => {
    const { children,config } = props;
    const AtomInOut = ReGen( CacheKey, config, {logger: true} );
     Atoms$ .next(AtomInOut);
    

    return <Container>{ children }</Container>;
    
};