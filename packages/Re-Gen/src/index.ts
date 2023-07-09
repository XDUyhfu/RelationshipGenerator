export type {
    IConfigItem,
    PlainResult,
    RxResult,
    ReturnResult,
    IDistinct,
    ReGenConfig,
    InitFunctionType,
} from "./type";
export type {
    IResultAtomsValue,
    IResultAtomsCallback,
} from "./hook/react";

export { ReGenRegisterConfig } from "./Builder";
export { FilterNilStage, CombineType } from "./config";
export { SetAtomValueByKey } from "./utils";
export { useAtomsValue, useAtomsCallback } from "./hook/react";

