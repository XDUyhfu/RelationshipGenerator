import classNames from "classnames";
import React from "react";
import {
    createContext,
    useState
} from "react";
import { MenuItemProps } from "./menuItem";

type SelectCallback = ( selectedIndex: number ) => void;

interface IMenuContext {
    index: number;
    onSelect?: SelectCallback;
}

export const MenuContext = createContext<IMenuContext>( { index: 0 } );

type MenuMode =
    "horizontal"
    | "vertical";

export interface MenuProps {
    defaultIndex?: number;
    className?: string;
    mode?: MenuMode;
    style?: React.CSSProperties;
    onSelect?: SelectCallback;
    children: React.ReactNode
}

const Menu: React.FC<MenuProps> = ( {
    className,
    mode = "horizontal",
    style,
    defaultIndex = 0,
    onSelect,
    children
} ) => {
    const classes = classNames( "menu", className, { "menu-vertical": mode === "vertical" } );

    const [currentActive, setCurrentActive] = useState( defaultIndex );
    const handleClick = ( index: number ) => {
        console.log( index );
        setCurrentActive( index );
        if ( onSelect ) {
            onSelect( index );
        }
    };
    const passedContext: IMenuContext = {
        index: currentActive,
        onSelect: handleClick
    };


    return <ul className={ `${ classes } flex flex-wrap border divide-x` } style={ style }>
        { <MenuContext.Provider value={ passedContext }>
            { React.Children.map( children, ( child, index ) => {
                if ( (child as React.FunctionComponentElement<MenuItemProps>)?.type?.name === "MenuItem" ) {
                    return React.cloneElement( child as React.ReactElement, { index } );
                }
            } ) }
        </MenuContext.Provider> }
    </ul>;
};

export default Menu;
