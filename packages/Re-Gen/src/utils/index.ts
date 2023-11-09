import { isObservable, of, ReplaySubject } from "rxjs";
import type { ObservableInput, BehaviorSubject } from "rxjs";
import type {
    IConfigItem,
    IDistinct,
    ReturnResult,
    PlainResult,
    IRelationConfig,
} from "../type";
import { FilterNilStage, DefaultValue } from "../config";
import {
    complement,
    compose,
    cond,
    flatten,
    forEach,
    is,
    isEmpty,
    isNil,
    map,
    mapObjIndexed,
    modifyPath,
    not,
    values,
} from "ramda";
import { Global, InitGlobal } from "../store";
import { AtomState, getOutObservable } from "../Atom.ts";

export const isArray = (value: any): value is Array<any> =>
    Array.isArray(value);
export const isPlainObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    value?.constructor === Object;

const isFunction = (value: any) =>
    Object.prototype.toString.call(value) === "[object Function]";
const isObject = (value: any) =>
    Object.prototype.toString.call(value) === "[object Object]" &&
    !isObservable(value);
export const isPlainResult = (result: ReturnResult): result is PlainResult =>
    ["number", "boolean", "string", "undefined"].includes(typeof result) ||
    isPlainObject(result) ||
    Array.isArray(result) ||
    result === null;
const isNotObservable = (value: any) =>
    isPlainResult(value) || isObject(value) || isFunction(value);

export const getDependNames = (item: IConfigItem) =>
    item.depend?.names || ([] as string[]);

export const getDependNamesWithSelf = (item: IConfigItem) => [
    item.name,
    ...getDependNames(item),
];

export const defaultReduceFunction = (_: any, val: any) => val;

/**
 * 将值转换成 ObservableInput, 从而使用 RxJS 进行处理
 * @param result
 */
export const transformResultToObservable = (
    result: ReturnResult,
): ObservableInput<any> =>
    isNotObservable(result) ? of(result) : (result as ObservableInput<any>);

/**
 * 根据用户传入的条件判断是否对空值进行过滤
 * - 支持传入布尔值或过滤阶段
 * @param stage 当前所处于的阶段
 * @param nilOption 空值过滤的选项
 */
export const transformFilterNilOptionToBoolean: (
    stage: FilterNilStage,
    nilOption?: FilterNilStage | boolean,
) => boolean = (stage, nilOption) => {
    if (stage === nilOption || nilOption === FilterNilStage.All || nilOption) {
        return true;
    }
    // 如果没有传入过滤空值的相关配置，则采用默认的处理方式
    if (isNil(nilOption) && DefaultValue.FilterNil.Stage.includes(stage)) {
        return DefaultValue.FilterNil.Value;
    }
    // 如果传入的 nilOption 为 false，也会返回false
    return false;
};

export const transformDistinctOptionToBoolean: (
    globalDistinct: boolean | undefined,
    itemDistinct: IDistinct<any, any>,
) => boolean | IDistinct<any, any> = (global, item) => {
    if (typeof item === "boolean" || typeof item === "object") {
        return item;
    }
    return global ?? DefaultValue.Distinct;
};

export const PluckName = (config: IConfigItem[]): string[] =>
    config.map((item) => item.name);

const JudgeRepetition = (RelationConfig: IConfigItem[]) =>
    forEach((item: IConfigItem) => {
        if (isEmpty(item.name) || isNil(item.name)) {
            throw new Error(`${item.name}: 无效的 name 属性`);
        }

        if (RelationConfig.filter((it) => it.name === item.name).length > 1) {
            throw new Error(`${item.name}: 重复的 name 属性`);
        }
    })(RelationConfig);

const isNotEmpty = complement(isEmpty);

export const CheckCacheKey = (CacheKey: string) => {
    if (not(is(String, CacheKey) && isNotEmpty(CacheKey))) {
        throw new Error("cacheKey 需要为字符串类型且长度大于0");
    }
    return true;
};

/**
 * 检查 ReGen 函数参数
 * @param CacheKey
 * @param RelationConfig
 * @param entry
 * @constructor
 */
const CheckReGenParams = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    entry: "hook" | "library",
) => {
    // 对 JudgeRepetition 的补充
    // 判断条件：
    // cacheKey是一个有效的字符串
    // RelationConfig 长度大于 0
    CheckCacheKey(CacheKey);
    if (entry === "hook") {
        if (not(isArray(RelationConfig) && isNotEmpty(RelationConfig))) {
            throw new Error("RelationConfig 需要为数组类型且长度大于0");
        }
    } else if (entry === "library") {
        if (not(isArray(RelationConfig))) {
            throw new Error("RelationConfig 需要为数组类型");
        }
    }
};

/**
 * 不能依赖自己 不能依赖不存在的 atom
 * @param RelationConfig
 * @constructor
 */
export const DependencyDetection = (RelationConfig: IConfigItem[]) =>
    forEach((item: IConfigItem) => {
        const dependNames = getDependNames(item);
        if (dependNames.includes(item.name)) {
            throw Error(`${item.name} 依赖了自己`);
        }
        dependNames.forEach((name) => {
            if (RelationConfig.filter((it) => it.name === name).length === 0) {
                throw Error(`${item.name} 的依赖项 ${name} 不存在`);
            }
        });
    })(RelationConfig);

export const CheckParams = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
    entry: "hook" | "library",
) => {
    if (!isInit(CacheKey)) return;
    // 参数检查在 hook 中，配置项不能为空
    // 作为库使用时可以为空，如果为空将不会对 CacheKey 进行存储
    CheckReGenParams(CacheKey, RelationConfig, entry);
    // 下面这两个判断是不论什么场景都需要进行判断的
    JudgeRepetition(RelationConfig);
    DependencyDetection(RelationConfig);
};

export const JointState = (CacheKey: string, name: string) =>
    `${DefaultValue.Prefix}:${CacheKey}:${name}`;

/**
 * 正确的格式是: prefix:CacheKey:name
 * @param joint
 */
export const isJointState = (joint: any) => {
    if (is(String, joint)) {
        if (joint.startsWith(`${DefaultValue.Prefix}:`)) {
            const rest = joint
                .replace(`${DefaultValue.Prefix}:`, "")
                .split(":");
            if (rest.length === 2) {
                if (rest[0].length > 0 && rest[1].length > 0) {
                    return rest;
                }
            }
        }
    }

    return false;
};

const generateNameWithCacheKeyWithCurry =
    (RecordKey: string | symbol) => (name: string) =>
        `${String(RecordKey)}${DefaultValue.Delimiter}${name}`;

export const generateNameInHook = (
    RecordKey: string | symbol,
    name?: string,
) => {
    if (RecordKey && name) {
        return generateNameWithCacheKeyWithCurry(RecordKey)(name);
    }
    return name;
};
/**
 * 合并多个数组为一个数组
 * @param RelationConfig
 */
export const recordToArrayType = (
    RelationConfig:
        | Record<string, IConfigItem[]>
        | Record<string, IConfigItem[][]>,
): IConfigItem[] =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    compose(
        flatten,
        values,
        mapObjIndexed((_, RecordKey, obj) =>
            map(
                (c: IConfigItem) =>
                    modifyPath<IConfigItem>(
                        ["depend", "names"],
                        map(generateNameWithCacheKeyWithCurry(RecordKey)),
                        modifyPath(
                            ["name"],
                            generateNameWithCacheKeyWithCurry(RecordKey),
                            c,
                        ),
                    ),
                obj![RecordKey] as IConfigItem[],
            ),
        ),
        map<IConfigItem[] | IConfigItem[][], IConfigItem[]>(flatten),
    )(RelationConfig);

export const flatRelationConfig = (
    RelationConfig: IRelationConfig,
): IConfigItem[] =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cond([
        [is(Array), flatten],
        [is(Object), recordToArrayType],
    ])(RelationConfig);

const isValidRelationConfig = (RelationConfig: IConfigItem[]) =>
    RelationConfig?.length > 0;
const isInit = (CacheKey: string) => !Global.Store.has(CacheKey);
export const checkInitConfig = (
    CacheKey: string,
    RelationConfig: IConfigItem[],
) => {
    return isInit(CacheKey) && isValidRelationConfig(RelationConfig);
};

/**
 * 通过 init 判断其是否是依赖于其他的 atom
 * 如果依赖于其他的 atom，在他的依赖没有生成之前，会产生一个中间状态的subject，之后通过订阅的方式将其进行链接 -- atom -- subject -- atom --
 *
 * @param CacheKey
 * @param item
 */
export const generateAndSaveAtom = (CacheKey: string, item: IConfigItem) => {
    const joint = isJointState(item.init);
    // 如果 observable 有值，说明其依赖已经生成
    let observable: BehaviorSubject<any> | ReplaySubject<any> | null = joint
        ? getOutObservable(joint[0])[joint[1]]
        : null;
    // 该 atom 需要链接到其他状态，但是那个 atom 还没有生成的时候，先产生一个中间bridge的 subject
    if (!observable && Array.isArray(joint)) {
        observable = new ReplaySubject(0);
        // 此时的 item.init 为 a:$$:b 类型
        Global.AtomBridge.set(item.init as string, [
            ...(Global.AtomBridge.get(item.init as string) ?? []),
            observable,
        ]);
    }
    const initValue = typeof item.init === "function" ? item.init() : item.init;
    const atom = new AtomState(joint ? observable : initValue, CacheKey, item);
    // 存储为全局变量
    if (!Global.Store.has(CacheKey)) InitGlobal(CacheKey);
    Global.Store.get(CacheKey)!.set(item.name, atom);
};

/**
 *  当一个 atom 生成的时候，就获取依赖于它的 subject ，然后通过 subscribe 的方式将其进行链接
 * @param CacheKey
 * @param item
 */
export const subscribeDependAtom = (CacheKey: string, item: IConfigItem) => {
    const jointName = JointState(CacheKey, item.name);
    const atom = Global.Store.get(CacheKey)!.get(item.name)!;
    if (Global.AtomBridge.has(jointName)) {
        Global.AtomBridge.get(jointName)!.forEach((observable) =>
            atom.out$.subscribe(observable),
        );
    }
};

export { AtomBridge } from "./AtomBridge.ts";
