import {
	concatMap,
	identity,
	of,
	map,
	combineLatestWith,
	distinctUntilChanged
} from "rxjs";
import { AtomInOut, AtomState, GlobalStore } from "./Atom";
import { handlePromiseResult } from "./utils";


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
			new AtomState( item.init )
			);
		} else {
			// 如果有重复的key 直接就报错了
			throw Error("The name in the configuration item is repeated. (配置项中name重复)");
		}
	});
	
	return of<IParam>( [cacheKey, RelationConfig] );
};


// 处理依赖关系 根据已有的 AtomState 生成新的 AtomState
const AtomHandle = ( [cacheKey, RelationConfig]: IParam) => {
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get(cacheKey)!.get( item.name )!;
		
		atom.in$.pipe( 
			map( item.handle || identity ),
			concatMap( handlePromiseResult ),
		).subscribe( atom.mid$ );
	} );

	// 让后续的操作符继续处理该 config
	return of<IParam>([cacheKey, RelationConfig] );
};

const getDependNames = (item: IConfigItem) => item.depend?.names || [];

const HandDepend = ( [cacheKey, RelationConfig]: IParam ) => { 
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get(cacheKey)!.get( item.name )!;

		const dependNames = getDependNames( item );
		
		// TODO 深层依赖需要重新考虑如何实现
		const dependAtomsIn$ = dependNames.map( name => {
			const dependItemIndex = RelationConfig.findIndex( config => config.name === name );
			if ( getDependNames( RelationConfig[dependItemIndex] ).length > 0 ) {
				return GlobalStore.get( cacheKey )!.get( name )!.out$;
			} else {
				return GlobalStore.get( cacheKey )!.get( name )!.mid$;
			}
			// 	.pipe(
			// 	map( RelationConfig[configIndex].handle || identity ),
			// 	concatMap( handlePromiseResult ),
			// );
		});
	
	
		if ( dependNames.length > 0 ) {
			atom.mid$.pipe(
				combineLatestWith( ...dependAtomsIn$ ),
				map( item.depend?.handle || identity ),
				concatMap( handlePromiseResult ),
				distinctUntilChanged()
			).subscribe(atom.out$);
		} else {
			atom.mid$.pipe(distinctUntilChanged()).subscribe(atom.out$);
		}
	} );
	
	return of<IParam>(  [cacheKey, RelationConfig]);
};

const BuilderRelation = ( cacheKey: string, RelationConfig: IConfigItem[] ) => 

	// 当前 pipe 通过从 config 文件生成 AtomState
	// 现将 AtomState 对像全部生成，然后再便利每个 config 对像，保证在处理以来的时候不会出现依赖的 AtomState 没有生成的情况

	of<IParam>( [cacheKey, RelationConfig] ).pipe(
		concatMap( FromConfigToAtomStore ),
		concatMap( AtomHandle ),
		concatMap( HandDepend ),
	);

export const ReGen = ( cacheKey: string, RelationConfig: IConfigItem[] ) => {
	
	GlobalStore.set( cacheKey, new Map<string, AtomState>() );

	BuilderRelation( cacheKey, RelationConfig ).subscribe();
	
	return AtomInOut( cacheKey );
};
