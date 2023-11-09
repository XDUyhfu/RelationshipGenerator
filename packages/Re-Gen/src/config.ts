// -- in -- handle -- depend -- reduce -- out --
// export enum TransformStage {
// 	// InAfter = "InAfter",
// 	In = "In",
// 	// HandleBefore = "HandleBefore",
// 	// Handle = "Handle",
// 	HandleAfter = "HandleAfter",
// 	// DependBefore = "DependBefore",
// 	// Depend = "Depend",
// 	DependAfter = "DependAfter",
// 	// ReduceBefore = "ReduceBefore",
// 	// Reduce = "Reduce",
// 	// ReduceAfter = "ReduceAfter",
// 	// OutBefore = "OutBefore",
// 	Out = "Out",
// }

export enum FilterNilStage {
    InBefore = "InBefore",
    In = "In",
    HandleAfter = "HandleAfter",
    DependBefore = "DependBefore",
    DependAfter = "DependAfter",
    OutAfter = "OutAfter",
    Out = "Out",
    All = "All",
    Default = "Default",
}

export enum CombineType {
    SELF_CHANGE = "SELF_CHANGE",
    ANY_CHANGE = "ANY_CHANGE",
    EVERY_CHANGE = "EVERY_CHANGE",
}

export const DefaultValue = {
    Distinct: false,
    FilterNil: {
        // 如果用户没有传入过滤空值的阶段的话，则使用默认值
        Option: FilterNilStage.Default,
        // 默认是否过滤空值
        Value: false,
        // 默认过滤空值的阶段
        Stage: [FilterNilStage.In, FilterNilStage.Out],
    },
    Delimiter: ":$$:",
    Prefix: "$$@ReGenPrefix",
    Suffix: "$$@ReGenSuffix",
};

export const ReGenPrefix = DefaultValue.Prefix;
