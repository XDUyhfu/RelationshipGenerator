import classNames from "classnames";
import Menu, { MenuContext } from "./menu";
import { useContext } from "react";

export interface MenuItemProps {
    index: number;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ( {
    index,
    disabled,
    className,
    style,
    children
} ) => {
    const context = useContext( MenuContext );

    const classes = classNames( "menu-item", className, {
        "is-disabled": disabled,
        "is-active": context.index === index
    } );

    const handleClick = () => {
        if ( context.onSelect && !disabled ) {
            context.onSelect( index );
        }
    };


    return <li className={ `${ classes } px-4 cursor-pointer hover:bg-gray-400 active:bg-gray-700 select-none` }
               style={ style } onClick={ handleClick }>
        { children }
    </li>;
};

export default MenuItem;
