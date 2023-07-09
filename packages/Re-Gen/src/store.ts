import { OperatorFunction } from "rxjs";
import {
	PluckValueType,
	ReGenOptions
} from "./type";
import { AtomState } from "./Atom";

export const GlobalStore = new Map<string, Map<string, AtomState>>();
export const GlobalConfig = new Map<string, PluckValueType[]>();
export const GlobalOptions = new Map<string, ReGenOptions>();
export const GlobalLoggerWatcher = new Map<
	string,
	<T>(
		marbleName: string,
		selector?: ((value: T) => any) | undefined
	) => OperatorFunction<T, T>
>();
