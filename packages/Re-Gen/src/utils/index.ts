import { from, of, isObservable } from "rxjs";

export function isPromise(p: any): p is Promise<any>  {
  return (p && Object.prototype.toString.call(p) === "[object Promise]") as boolean;
}
export function handlePromise<T> ( promise: Promise<T> ) {
  return from( promise );
}

export function handleResult ( result: any ) {
  // return from(result);
  if ( isPromise( result ) ) {
    return handlePromise(result);
  }
  if ( isObservable( result ) ) {
    return result;
  }
  return of(result);
}