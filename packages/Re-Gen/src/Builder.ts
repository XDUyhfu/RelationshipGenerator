import {
	concatMap,
	from,
	identity,
	of,
	map as rxMap,
	toArray,
	take,
	combineLatestWith
} from "rxjs";
import { AtomInOut, AtomState, AtomStore } from "./Atom";
import { path, map, compose, defaultTo, } from "ramda";
import { handleFunctionResult } from "./utils";


export interface IConfigItem {
	name: string;
	init?: unknown;
	handle?: ( ...args: unknown[] ) => unknown;
	depend?: {
		names: string[];
		handle: ( ...args: unknown[] ) => unknown;
	};
}

const saveAtom: ( name: string, value: AtomState ) => void = ( name, value ) => {
	if ( !AtomStore.has( name ) ) {
		AtomStore.set(
			name,
			value
		);
	}
};

// 因为配置项的顺序可能在依赖项的前边，所以先将所有的单状态进行存储，然后再处理依赖关系
const FromConfigToAtomStore = ( ConfigItem: IConfigItem ) => {
	if ( !AtomStore.has( ConfigItem.name ) ) {
		const atom = new AtomState<typeof ConfigItem.init>( ConfigItem.init );
		saveAtom(
			ConfigItem.name,
			atom
		);
	}
	return of( ConfigItem );
};

const getAtom: ( name: string ) => AtomState = ( name ) => AtomStore.get( name )!;
const getDependNames: ( ConfigItem: IConfigItem ) => string[] = path( ["depend", "names"] ) as any;
const getDependAtoms: ( ConfigItem: IConfigItem ) => AtomState[] = compose(
	map( getAtom ),
	defaultTo( [] ),
	getDependNames
);

// 处理依赖关系 根据已有的 AtomState 生成新的 AtomState
const AtomHandle = ( RelationConfig: IConfigItem[] ) => {

	RelationConfig.map( ConfigItem => {
		const atom = getAtom( ConfigItem.name );
		const dependAtoms = getDependAtoms( ConfigItem );

		if ( dependAtoms.length ) {
			atom.out$ = atom.in$.pipe( 
				rxMap( ConfigItem?.handle || identity ),
				concatMap( handleFunctionResult ),
			);
		
		} else {
			atom.out$ = atom.in$.pipe(
				rxMap( ConfigItem?.handle || identity ),
				concatMap( handleFunctionResult ),
			);
		}
	} );

	// 让后续的操作符继续处理该 config item
	return of( RelationConfig );
};

const HandDepend = ( RelationConfig: IConfigItem[] ) => { 

	RelationConfig.map( ConfigItem => {
		const atom = getAtom( ConfigItem.name );
		const dependAtoms = getDependAtoms( ConfigItem );
		const dependNames = getDependNames( ConfigItem );
		const dependAtomsInList = dependNames?.map( name => {
			const configIndex = RelationConfig.findIndex( config => config.name === name );
			return getAtom( name ).out$.pipe(
				rxMap( RelationConfig[configIndex].handle || identity ),
				concatMap( handleFunctionResult ),
			);
		} );
	
		if ( dependAtoms.length ) {
			atom.out$ = atom.out$.pipe(
				combineLatestWith( ...dependAtomsInList ),
				rxMap( ConfigItem.depend?.handle || identity ),
				concatMap( handleFunctionResult ),
			);
		} else {
			atom.out$ = atom.out$.pipe();
		}
	} );
	
	return of( RelationConfig );
};

const BuilderRelation = ( RelationConfig: IConfigItem[] ) =>
	// 当前 pipe 通过从 config 文件生成 AtomState
	// 现将 AtomState 对像全部生成，然后再便利每个 config 对像，保证在处理以来的时候不会出现依赖的 AtomState 没有生成的情况
	from( RelationConfig ).pipe(
		concatMap( FromConfigToAtomStore ),
		take( RelationConfig.length ),
		toArray(),
		concatMap( AtomHandle ),
		concatMap(HandDepend)
	);

export const ReGen = (RelationConfig: IConfigItem[]) => {
	BuilderRelation( RelationConfig ).subscribe();
	return AtomInOut;
};
