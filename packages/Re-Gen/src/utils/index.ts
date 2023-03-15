import {
	Observable,
	of,
	distinctUntilChanged,
	identity,
	combineLatestWith,
	withLatestFrom,
	catchError,
	EMPTY,
	zipWith,
} from "rxjs";
import {
	AnyBehaviorSubject,
	AnyObservable,
	CombineType,
	IConfigItem,
	IDistinct,
	LoggerOption,
	FilterNilOption,
	ReturnResult,
	TransformStage,
} from "../type";
import {
	filter,
	isNil,
	not,
	compose,
	equals
} from "ramda";
import { GlobalLoggerWatcher } from "../Atom";
import {
	isArray,
	isObject,
	isPlainResult
} from "@yhfu/re-gen-utils";
import { DistinctDefaultValue } from "../config";

export const getDependNames = ( item: IConfigItem ) => item.depend?.names || [];
export const defaultReduceFunction = ( _: any, val: any ) => val;

const removeObjectOrListUndefinedValue = filter( compose( not, isNil ) );

export const removeUndefined = ( value: any ) => isObject( value ) || isArray( value ) ? removeObjectOrListUndefinedValue( value ) : value;

export const handleResult = ( result: ReturnResult ) => isPlainResult( result ) ? of( removeUndefined( result ) ) : result;

export const handleUndefined: ( open: boolean ) => ( source: AnyObservable ) => AnyObservable = ( open ) => ( source ) => new Observable( ( observer ) => {
	source.subscribe( {
		next: ( value ) => {
			if ( open ) {
				if ( isObject( value ) || isArray( value ) ) {
					observer.next( removeObjectOrListUndefinedValue( value ) );
				} else {
					if ( !isNil( value ) ) {
						observer.next( value );
					}
				}
			} else {
				observer.next( value );
			}
		},
		error: ( err ) => observer.error( err ),
		complete: () => observer.complete(),
	} );
} );

export const handleDistinct = ( param: IDistinct<any, any> ): (( source: AnyObservable ) => AnyObservable) => ( source ) => {
	if ( typeof param === "boolean" ) {
		return param ? source.pipe( distinctUntilChanged( equals ) ) : source;
	} else {
		return source.pipe( distinctUntilChanged( param.comparator, param.keySelector || identity ) );
	}
};

export const handleCombine = ( type: CombineType, depends: AnyBehaviorSubject[] ): (( source: AnyObservable ) => AnyObservable) => ( source ) => type === "self" ? source.pipe( withLatestFrom( ...depends ) ) : type === "every" ? source.pipe( zipWith( ...depends ) ) : source.pipe( combineLatestWith( ...depends ) );

export const handleError = ( message: string ): (( source: AnyObservable ) => AnyObservable) => ( source ) => source.pipe( catchError( () => {
	console.error( message );
	return EMPTY;
} ) );

export const handleLogger = ( cacheKey: string, name: string, open?: LoggerOption ): (( source: AnyObservable ) => AnyObservable) => open ? GlobalLoggerWatcher.get( cacheKey )!( `${ name }` ) : identity;

export const transformFilterNilOptionToBoolean: ( stage: TransformStage, nil: FilterNilOption ) => boolean = ( stage, nil ) => {
	if ( typeof nil === "boolean" ) {
		if ( !nil ) {
			return false;
		} else {
			if ( stage === "In" ) {
				return true;
			}
			return false;
		}
	} else {
		if ( nil === "all" ) {
			return true;
		} else {
			if ( stage === "In" ) {
				return true;
			}
			return false;
		}
	}
	return false;
};

export const transformDistinctOptionToBoolean: ( globalDistinct: boolean | undefined, itemDistinct: IDistinct<any, any> ) => boolean | IDistinct<any, any> = ( global, item ) => {
	if ( typeof item === "boolean" || typeof item === "object" ) {
		return item;
	}
	return global ?? DistinctDefaultValue;
};
