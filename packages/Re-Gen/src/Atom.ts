import { BehaviorSubject, Observable, Subject, of } from "rxjs";

/**
 * 一个配置项会生成一个AtomState
 * 通过 in$ 对数据进行修改
 * in$ 和 out$ 之间可以插入 map 等逻辑
 * 可以监听 out$ 得到变换后的数据
 */

export class AtomState<T = unknown> {
    in$: BehaviorSubject<T>;
    out$: Observable<T>;

    constructor( init: T ) {
        this.in$ = new BehaviorSubject( init );
        this.out$ = new BehaviorSubject( init );
    }/*  */
}

export const GlobalStore = new Map<string, Map<string, AtomState>>();
export const AtomInOut = <T = unknown>( valueName: string ) => {
    const atom = AtomStore?.get( valueName );
    if (!atom) { throw new Error("The key value is not included in the configuration list for building.(用于构建的配置列表中不包含该key值)"); }
    return {
        [`${ valueName }In$`]: atom.in$,
        [`${ valueName }Out$`]: atom.out$ || of() 
    } as {
        [x: `${ string }In$`]: Subject<T>,
        [x: `${string}Out$`]:Observable<T>
    };
};
