import { isObservable, of } from "rxjs";
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