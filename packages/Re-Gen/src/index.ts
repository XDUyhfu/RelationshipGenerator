export { GetAtomValues, GetAtomObservables, GetAtomValueByName } from "./Atom";
export type {
    IConfigItem,
    PlainResult,
    RxResult,
    ReturnResult,
    IDistinct,
    ReGenOptions,
    InitFunctionType,
} from "./type";
export { ReGenRegisterConfig } from "./Builder";
export { TransformStage, FilterNilStage, CombineType } from "./config";
export { SetAtomValueByKey } from "./utils";
export { useAtomsValue, useAtomsCallback } from "./hook/react";
export type {
    IResultAtomsValue,
    IResultAtomsCallback,
} from "./hook/react";
