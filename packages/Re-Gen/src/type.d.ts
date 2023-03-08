import { Observable, ObservableInput } from "rxjs";

export type IParam = [cacheKey: string, RelationConfig: IConfigItem[]];

export type PlainResult =
	Record<string, any>
	| number
	| string
	| boolean
	| undefined
	| null;
export type RxResult = ObservableInput<any>;

export type ReturnResult =
	PlainResult
	| RxResult;

export type IDistinct<T, K> =
	boolean
	| {
	comparator: ( previous: K, current: K ) => boolean, keySelector?: ( value: T ) => K
}

export type CombineType =
	"self"
	| "any"

export interface IConfigItem {
	name: string;
	init?: Promise | Observable | PlainResult;
	handle?: ( arg: any ) => ReturnResult;
	distinct?: IDistinct;
	depend?: {
		names: string[]; handle: ( args: any ) => ReturnResult; reduce?: ( pre: any, val: any ) => any; combineType?: CombineType
	};
}
