import { BehaviorSubject, of } from "rxjs";

// -- in -- handle -- depend -- reduce -- out --
export enum TransformStage {
	// InBefore = "InBefore",
	// InAfter = "InAfter",
	In = "In",
	// HandleBefore = "HandleBefore",
	// Handle = "Handle",
	HandleAfter = "HandleAfter",
	// DependBefore = "DependBefore",
	// Depend = "Depend",
	DependAfter = "DependAfter",
	// ReduceBefore = "ReduceBefore",
	// Reduce = "Reduce",
	// ReduceAfter = "ReduceAfter",
	// OutBefore = "OutBefore",
	Out = "Out",
	// OutAfter = "OutAfter",
}

export enum FilterNilStage {
	In = "In",
	HandleAfter = "HandleAfter",
	DependAfter = "DependAfter",
	Out = "Out",
	All = "All",
	Default = "Default"
}

export enum CombineType {
	SELF_CHANGE = "SELF_CHANGE",
	ANY_CHANGE = "ANY_CHANGE",
	EVERY_CHANGE = "EVERY_CHANGE"
}

export const FilterNilDefaultConfig = {
	// 如果用户没有传入过滤空值的阶段的话，则使用默认值
	Option: FilterNilStage.Default,
	// 默认是否过滤空值
	Value: false,
	// 默认过滤空值的阶段
	Stage: [FilterNilStage.In, FilterNilStage.Out]
};

export const LoggerDurationDefaultValue = 300;
export const DistinctDefaultValue = true;
export const DefaultName = "@@$";
export const DefaultRelationConfig = [{ name: DefaultName }];
export const DefaultOut$ = of(null);
export const DefaultIn$ = new BehaviorSubject(null);
export const DefaultFunction = () => ({});

