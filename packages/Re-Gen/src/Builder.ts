import {
	identity,
	of,
	map,
	combineLatestWith,
	distinctUntilChanged,
	switchMap,
	catchError,
} from "rxjs";
import { AtomInOut, AtomState, GlobalStore } from "./Atom";
import { handlePromise, handleResult } from "./utils";
import { IConfigItem, IParam } from "./type";

const getDependNames = ( item: IConfigItem ) => item.depend?.names || [];

// 因为配置项的顺序可能在依赖项的前边，所以先将所有的单状态进行存储，然后再处理依赖关系
const FromConfigToAtomStore = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		if ( !GlobalStore.get( cacheKey )!.has( item.name ) ) {
			GlobalStore.get( cacheKey )!.set(
				item.name,
				new AtomState( item.init )
			);
		} else {
			// 如果有重复的key 直接就报错了
			throw Error( "配置项中 name 字段重复" );
		}
	} );

	return [cacheKey, RelationConfig] as IParam;
};

// 处理自身的 handler
const AtomHandle = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get( cacheKey )!.get( item.name )!;
		atom.in$.pipe(
			handlePromise(),
			// 执行 handle
			map( item.handle || identity ),

			// 处理 result 为 ObservableInput
			// 使用 switchMap 的原因是因为一个 Observable 中可能会产生多个值，此时需要将之前的取消并切换为新值
			switchMap( handleResult ),
			catchError( () => {
				console.error( `捕获到 ${ item.name } handle 中报错` );
				return of( undefined );
			} ),
		).subscribe( atom.mid$ );
	} );

	return [cacheKey, RelationConfig] as IParam;
};

const HandDepend = ( [cacheKey, RelationConfig]: IParam ) => {
	RelationConfig.forEach( item => {
		const atom = GlobalStore.get( cacheKey )!.get( item.name )!;
		const dependNames = getDependNames( item );

		const dependAtomsIn$ = dependNames.map( name =>
			GlobalStore.get( cacheKey )!.get( name )!.out$
		);

		if ( dependNames.length > 0 ) {
			atom.mid$.pipe(
				combineLatestWith( ...dependAtomsIn$ ),
				map( item.depend?.handle || identity ),
				switchMap( handleResult ),
				distinctUntilChanged(),
				catchError( () => {
					console.error( `捕获到 ${ item.name } depend.handle 中报错` );
					return of( undefined );
				} ),
			).subscribe( atom.out$ );
		} else {
			atom.mid$.pipe(
				distinctUntilChanged(),
				catchError( () => of( undefined ) ),
			).subscribe( atom.out$ );
		}
	} );

	return [cacheKey, RelationConfig] as IParam;
};

const BuilderRelation = ( cacheKey: string, RelationConfig: IConfigItem[] ) =>

	// 当前 pipe 通过从 config 文件生成 AtomState
	// 现将 AtomState 对像全部生成，然后再便利每个 config 对像，保证在处理以来的时候不会出现依赖的 AtomState 没有生成的情况

	of<IParam>( [cacheKey, RelationConfig] ).pipe(
		map( FromConfigToAtomStore ),
		map( AtomHandle ),
		map( HandDepend ),
	);

export const ReGen = ( cacheKey: string, RelationConfig?: IConfigItem[] ) => {

	if ( !RelationConfig ) { // 不传入 RelationConfig 意味着要从 GlobalStore 中取值
		if ( GlobalStore.has( cacheKey ) ) { return AtomInOut( cacheKey ); }
	} else { // 传入 RelationConfig 则新建
		GlobalStore.set( cacheKey, new Map<string, AtomState>() );
		BuilderRelation( cacheKey, RelationConfig ).subscribe();
		return AtomInOut( cacheKey );
	}
	// 不传入 RelationConfig 并且 cacheKey 无效 抛出异常
	throw new Error( "无效的 cacheKey " );
};
