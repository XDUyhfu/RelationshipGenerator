export { GetAtomValues, GetAtomObservables, GetAtomValueByName } from "./Atom";
export type {
    IConfigItem,
    PlainResult,
    RxResult,
    ReturnResult,
    IDistinct,
    ReGenOptions,
    AnyObservable,
    AnyBehaviorSubject,
    AnyArray,
    AnyPromise,
    InitFunctionType,
} from "./type";
export { TransformStage, FilterNilStage, CombineType } from "./config";
export { SetAtomValueByKey } from "./utils";
export { useAtomsValue, useAtomsCallback } from "./hook/react";
export type {
    IResultAtomsValue,
    IResultAtomsCallback,
} from "./hook/react";
