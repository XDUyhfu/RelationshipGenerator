import { ObservableInput } from "rxjs";

export type IParam = [cacheKey: string, RelationConfig: IConfigItem[]];

export type PlainResult = Record<string, any> | number | string | boolean | undefined | null;
export type RxResult = ObservableInput<any>;

export type ReturnResult = PlainResult | RxResult;

export interface IConfigItem {
	name: string;
	init?: any;
	handle?: ( arg: any ) => ReturnResult;
	depend?: {
		names: string[];
		handle: ( args: any ) => ReturnResult;
	};
}