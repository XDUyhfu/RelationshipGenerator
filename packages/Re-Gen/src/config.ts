import { BehaviorSubject, of } from "rxjs";
import { CombineType, FilterNilOption, TransformStage } from "./type";

export const FilterNilOptionDefaultValue: FilterNilOption = "Default";
export const FilterNilDefaultValue = false;
export const FilterNilStageDefaultValue: TransformStage[] = ["In", "Out"];
export const RxjsWaterDurationDefaultValue = 200;
export const CombineTypeDefaultValue: CombineType = "any";
export const DistinctDefaultValue = true;

export const DefaultName = "@@$";
export const DefaultRelationConfig = [{ name: DefaultName }];
export const DefaultOut$ = of(null);
export const DefaultIn$ = new BehaviorSubject(null);
export const DefaultFunction = () => ({});
