import { OperatorFunction } from "rxjs";
import {
	PluckValueType,
	ReGenConfig
} from "./type";
import { AtomState } from "./Atom";

export const Global = {
	Store: new Map<string, Map<string, AtomState>>(),
	RelationConfig: new Map<string, PluckValueType[]>(),
	Config: new Map<string, ReGenConfig>(),
	LoggerWatcher: new Map<
		string,
		<T>(
			marbleName: string,
			selector?: ((value: T) => any) | undefined
		) => OperatorFunction<T, T>
	>()
};
