import { Observable, from, isObservable, of } from "rxjs";
import { PlainResult, ReturnResult } from "../type";

export function isPlainResult ( result: ReturnResult ): result is PlainResult {
  return ["number", "boolean", "string", "undefined"].includes( typeof result ) || Object.prototype.toString.call( result ) === "[object Object]" || Array.isArray( result ) || result === null;
}

export function handleResult ( result: ReturnResult ) {
  if ( isPlainResult( result ) ) {
    if ( isObservable( result ) ) {
      return result;
    }
    return of( result );
  }
  return result;
}

export function handlePromise<T> (): ( source: Observable<T> ) => Observable<T> {
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
