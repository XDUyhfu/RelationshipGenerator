import { from, of } from "rxjs";

export function isPromise(p: unknown): p is Promise<unknown>  {
  return (p && Object.prototype.toString.call(p) === "[object Promise]") as boolean;
}

export function handlePromise<T> ( promise: Promise<T> ) {
  return from( promise );
}

export function handleFunctionResult ( result: any ) {
  // return from(result);
  if ( isPromise( result ) ) {
    return handlePromise(result);
  }
  return of(result);
}