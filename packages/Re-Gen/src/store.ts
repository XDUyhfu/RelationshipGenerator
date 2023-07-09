import { OperatorFunction } from "rxjs";
import { PluckValueType } from "./type";
import { AtomState } from "./Atom";

export const Global = {
	Store: new Map<string, Map<string, AtomState>>(),
	RelationConfig: new Map<string, PluckValueType[]>(),
	LoggerWatcher: new Map<
		string,
		<T>(
			marbleName: string,
			selector?: ((value: T) => any) | undefined
		) => OperatorFunction<T, T>
	>()
};
