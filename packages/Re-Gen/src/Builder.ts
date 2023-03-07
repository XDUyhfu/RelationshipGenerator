import {
	identity,
	of,
	map,
	switchMap,
	catchError,
	scan,
	EMPTY,
} from "rxjs";
import {
	AtomInOut,
	AtomState,
	GlobalStore
} from "./Atom";
import {
	defaultReduce,
	getDependNames,
	handleDistinct,
	handlePromise,
	handleResult,
	handleUndefined,
	hanldeCombine,
} from "./utils";
import {
	IConfigItem,
	IParam
} from "./type";

// 因为配置项的顺序可能在依赖项的前边，所以先将所有的单状态进行存储，然后再处理依赖关系
const ConfigToAtomStore = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		if ( !GlobalStore.get( cacheKey )!.has( item.name ) ) {
			GlobalStore.get( cacheKey )!.set( item.name, new AtomState( item.init ) );
		} else {
			// 如果有重复的 key 直接就报错了
			throw Error( "配置项中 name 字段重复" );
		}
	} );

	return [cacheKey, RelationConfig] as IParam;
};

// 处理自身的 handler
const AtomHandle = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get( cacheKey )!.get( item.name )!;
		atom.in$.pipe( // 执行 handle
			handlePromise(), map( item.handle || identity ), // 处理 result 为 ObservableInput
			// 使用 switchMap 的原因是因为一个 Observable 中可能会产生多个值，此时需要将之前的取消并切换为新值
			switchMap( handleResult ), catchError( () => {
				console.error( `捕获到 ${ item.name } handle 中报错` );
				return EMPTY;
			} ),
		).subscribe( atom.mid$ );
	} );

	return [cacheKey, RelationConfig] as IParam;
};

const HandDepend = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get( cacheKey )!.get( item.name )!;
		const dependNames = getDependNames( item );
		const dependAtomsIn$ = dependNames.map( name => GlobalStore.get( cacheKey )!.get( name )!.out$ );

		if ( dependNames.length > 0 ) {
			atom.mid$.pipe( hanldeCombine( item.depend?.combineType || "any", dependAtomsIn$ ), map( item.depend?.handle || identity ), catchError( () => {
				console.error( `捕获到 ${ item.name } depend.handle 中报错` );
				return EMPTY;
			} ), scan( item.depend?.reduce || defaultReduce, item.init ), switchMap( handleResult ), handleUndefined(), handleDistinct( item.distinct ?? true ), catchError( () => {
				console.error( `捕获到 ${ item.name } depend.scan 中报错` );
				return EMPTY;
			} ), ).subscribe( atom.out$ );
		} else {
			atom.mid$.pipe( handleUndefined(), handleDistinct( item.distinct ?? true ), catchError( () => EMPTY ), ).subscribe( atom.out$ );
		}

	} );

	return [cacheKey, RelationConfig] as IParam;
};

const BuilderRelation = ( cacheKey: string, RelationConfig: IConfigItem[] ) =>

	// 当前 pipe 通过从 config 文件生成 AtomState
	// 现将 AtomState 对像全部生成，然后再便利每个 config 对像，保证在处理以来的时候不会出现依赖的 AtomState 没有生成的情况

	of<IParam>( [cacheKey, RelationConfig] ).pipe( map( ConfigToAtomStore ), map( AtomHandle ), map( HandDepend ), );

export const ReGen = ( cacheKey: string, RelationConfig?: IConfigItem[] ) => {

	if ( GlobalStore.has( cacheKey ) ) {
		return AtomInOut( cacheKey );
	} else if ( RelationConfig ) {
		GlobalStore.set( cacheKey, new Map<string, AtomState>() );
		BuilderRelation( cacheKey, RelationConfig ).subscribe();
		return AtomInOut( cacheKey );
	}

	throw new Error( "无效的 cacheKey " );
};
