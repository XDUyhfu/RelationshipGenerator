import {
	BehaviorSubject,
	OperatorFunction
} from "rxjs";
import { PluckValueType } from "./type";
import { AtomState } from "./Atom";

export const Global = {
	Store: new Map<string, Map<string, AtomState>>(),
	RelationConfig: new Map<string, PluckValueType[]>(),
	AtomBridge: new Map<string, BehaviorSubject<any>[]>(),
	LoggerWatcher: new Map<
		string,
		<T>(
			marbleName: string,
			selector?: ((value: T) => any) | undefined
		) => OperatorFunction<T, T>
	>()
};
