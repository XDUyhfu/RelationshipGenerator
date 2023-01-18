import { Subject, Observable } from "rxjs";
import { useObservable } from "rxjs-hooks";

interface IConfigItem {
	name: string; 
	init?: unknown;
	handle?: ( ...args: unknown[] ) => unknown;
	depend?: {
		names: string[];
		handle: ( ...args: unknown[] ) => unknown;
	};
}

type IAtomInOut = <T = unknown>(valueName: string) => {
    [x: `${string}In$`]: Subject<T>;
    [x: `${string}Out$`]: Observable<T>;
}

interface IResultAtoms<T = unknown> {
    [x: `${ string }In$`]: Subject<T>,
    [x: `${ string }Value`]: T
}

export const useAtoms = (AtomInOut:IAtomInOut, RelationConfig: IConfigItem[] ) => {
    const names = RelationConfig.map( item => item.name );
    const getConfigItem = (name: string) => RelationConfig.filter(item => item.name === name)[0];
    
    const Atoms:IResultAtoms = names.reduce( ( pre, name ) => {
        const inout$ = AtomInOut( name );        
        
        return {
            ...pre,
            [`${ name }In$`]: inout$[`${ name }In$`],
            [`${name}Value`]: useObservable(() => inout$[`${ name }Out$`], getConfigItem(name).init)
        };
    }, {} as IResultAtoms );

    return Atoms;
};