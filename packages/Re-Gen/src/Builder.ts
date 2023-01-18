import {
	concatMap,
	identity,
	of,
	map,
	combineLatestWith
} from "rxjs";
import { AtomInOut, AtomState, GlobalStore } from "./Atom";
import { handleFunctionResult } from "./utils";


interface IConfigItem {
	name: string;
	init?: unknown;
	handle?: ( ...args: unknown[] ) => unknown;
	depend?: {
		names: string[];
		handle: ( ...args: unknown[] ) => unknown;
	};
}

type IParam = [cacheKey: string, RelationConfig: IConfigItem[]]

// 因为配置项的顺序可能在依赖项的前边，所以先将所有的单状态进行存储，然后再处理依赖关系
const FromConfigToAtomStore = ( [cacheKey, RelationConfig]:IParam ) => {
	const AtomStore = GlobalStore.get( cacheKey )!;
	RelationConfig.forEach( item => {
		
		if ( !AtomStore.has( item.name ) ) {
			AtomStore.set(
			item.name,
			new AtomState<typeof item.init>( item.init )
			);
		} else {
			// 如果有重复的key 直接就报错了
			throw Error("The name in the configuration item is repeated. (配置项中name重复)");
		}
	});
	
	return of( [cacheKey, RelationConfig] as IParam );
};

const getAtom: ( cacheKey: string, name: string ) => AtomState = ( cacheKey, name ) => GlobalStore.get(cacheKey)!.get( name )!;
const getDependNames: ( ConfigItem: IConfigItem ) => string[] = ( item ) => item.depend?.names || [];
const getDependAtoms: ( cacheKey: string, ConfigItem: IConfigItem ) => AtomState[] =
	( cacheKey, ConfigItem ) => getDependNames( ConfigItem )?.map( name => getAtom(cacheKey, name));

// 处理依赖关系 根据已有的 AtomState 生成新的 AtomState
const AtomHandle = ( [cacheKey, RelationConfig]: IParam) => {
	RelationConfig.map( ConfigItem => {
		const atom = getAtom( cacheKey, ConfigItem.name );

		atom.out$ = atom.in$.pipe( 
				map( ConfigItem?.handle || identity ),
				concatMap( handleFunctionResult ),
			);
	} );

	// 让后续的操作符继续处理该 config item
	return of([cacheKey, RelationConfig] as IParam );
};

const HandDepend = ( [cacheKey, RelationConfig]: IParam ) => { 

	RelationConfig.map( ConfigItem => {
		const atom = getAtom( cacheKey, ConfigItem.name );
		const dependAtoms = getDependAtoms( cacheKey, ConfigItem );
		const dependNames = getDependNames( ConfigItem );
		const dependAtomsInList = dependNames?.map( name => {
			const configIndex = RelationConfig.findIndex( config => config.name === name );
			return getAtom( cacheKey, name ).out$.pipe(
				map( RelationConfig[configIndex].handle || identity ),
				concatMap( handleFunctionResult ),
			);
		} );
	
		if ( dependAtoms.length ) {
			atom.out$ = atom.out$.pipe(
				combineLatestWith( ...dependAtomsInList ),
				map( ConfigItem.depend?.handle || identity ),
				concatMap( handleFunctionResult ),
			);
		} else {
			atom.out$ = atom.out$.pipe();
		}
	} );
	
	return of(  [cacheKey, RelationConfig] as IParam);
};

const BuilderRelation = ( cacheKey: string, RelationConfig: IConfigItem[] ) => 

	// 当前 pipe 通过从 config 文件生成 AtomState
	// 现将 AtomState 对像全部生成，然后再便利每个 config 对像，保证在处理以来的时候不会出现依赖的 AtomState 没有生成的情况

	of<IParam>( [cacheKey, RelationConfig] ).pipe(
		concatMap( FromConfigToAtomStore ),
		concatMap( AtomHandle ),
		concatMap(HandDepend)
	) ;

export const ReGen = ( cacheKey: string, RelationConfig: IConfigItem[] ) => {
	GlobalStore.set(cacheKey, new Map<string, AtomState>());
	BuilderRelation( cacheKey, RelationConfig ).subscribe();
	return AtomInOut(cacheKey);
};
