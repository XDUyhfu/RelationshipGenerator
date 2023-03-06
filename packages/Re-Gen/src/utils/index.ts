import {
	Observable,
	from,
	isObservable,
	of
} from "rxjs";
import {
	IConfigItem,
	PlainResult,
	ReturnResult
} from "../type";

export const getDependNames = ( item: IConfigItem ) => item.depend?.names || [];

export const defaultReduce = ( _: any, val: any ) => val;

function isObject( value: any ) {
	return Object.prototype.toString.call( value ) === "[object Object]";
}

function removeUndefinedValue( value: any ) {
	return JSON.parse( JSON.stringify( value ) );
}

export function isPlainResult( result: ReturnResult ): result is PlainResult {
	return ["number", "boolean", "string", "undefined"].includes( typeof result ) || isObject( result ) || Array.isArray( result ) || result === null;
}

export function handleResult( result: ReturnResult ) {
	if ( isPlainResult( result ) ) {
		if ( isObservable( result ) ) {
			return result;
		}
		return of( result );
	}
	return result;
}

export function handlePromise<T>(): ( source: Observable<T> ) => Observable<T> {
	return ( source: Observable<T> ): Observable<T> => new Observable( ( observer ) => {
		source.subscribe( {
			next: ( value ) => {
				// 如果 value 是 Promise 对象，则转换成 Observable 并订阅
				if ( value instanceof Promise ) {
					from( value ).subscribe( {
						next: ( val ) => observer.next( val ),
						error: ( err ) => observer.error( err ),
						complete: () => observer.complete(),
					} );
				} else {
					observer.next( value );
				}
			},
			error: ( err ) => observer.error( err ),
			complete: () => observer.complete(),
		} );
	} );
}


export function handleUndefined(): ( source: Observable<any> ) => Observable<any> {
	return ( source: Observable<any> ): Observable<any> => new Observable( ( observer ) => {
		source.subscribe( {
			next: ( value ) => {
				// 如果 value 是 Promise 对象，则转换成 Observable 并订阅
				if ( isObject( value ) ) {
					observer.next( removeUndefinedValue( value ) );
				} else if ( Array.isArray( value ) ) {
					observer.next( value.filter( val => !!val ).map( item => isObject( value ) ? removeUndefinedValue( item ) : item ) );
				} else {
					observer.next( value );
				}
			},
			error: ( err ) => observer.error( err ),
			complete: () => observer.complete(),
		} );
	} );
}

