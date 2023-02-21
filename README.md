# 基于rxjs的状态生成器

**NPM地址** [@yhfu/re-gen](https://www.npmjs.com/package/@yhfu/re-gen)  [@yhfu/re-gen-hooks](https://www.npmjs.com/package/@yhfu/re-gen-hooks)

> 初期开发阶段，API不稳定，谨(不)慎(用)使(也)用(行)！

> 此库不定时更新

<!-- ## 遗留问题说明

该库在实现的过程中采用的是 `BehaviorSubject` 进行实现。更具 `BehaviorSubject` 的特性，在使用的过程中会存在一个缓存，这个问题会导致有些更具配置项的处理函数需要更多的判断进行处理，或者就没办法处理（具体case相见 apps/demo/src/config 中name为 testMoreMoreDepend 的配置项问题 ）。

❕❕❕强烈建议❕❕❕：在使用的过程中最好有一定的规范，例如只对**没有依赖项的数据**（可以将有依赖项的数据当作没有依赖项数据的计算值）进行修改等等。 -->

✨🌟✨🌟✨🌟 ***存在问题，但是会尽快解决*** 🌟✨🌟✨🌟✨

## 为什么会有该库
> 有个简单的想法，就是将状态处理和组件UI分开进行管理。为了实现这个想法，目前就是将状态和其处理的函数通过配置文件的方式进行声明。但是简单的声明并不能很好的满足开发的需求，因此还需要能够处理数据之间的依赖关系等等。为此，通过使用RxJS提供的合并类操作符等，进行数据依赖的处理。所以就诞生了这个小工具。

## 什么场景适合使用？
> 当然，每个场景都使用使用。但是这个工具还是专门为 ***构建组件*** 进行开发的。可以参考 apps/form-filter 这个例子，在这种组件的场景中，包含有大量的依赖逻辑的处理，特别的适合。

## 哲学？
> 很多东西在造出来之后，都会有一系列的哲学思考。这个工具践行的是 组件UI和逻辑 分析的思想，类似于 headless UI，使逻辑更容易的维护以及复用。

## demo
> 提供了3个demo，一个用于测试（apps/demo），一个是实际场景的案例（apps/FormFilter），一个用于自更新的场景（app/Form）。

如果使用该工具，需要提供一组配置项，单个配置项的格式如下所示，具体使用方式可以参照 apps/demo/src/config.ts 的配置文件。

```typescript
export interface IConfigItem {
	name: string;
	init?: any;
    // 对当前值进行处理
	handle?: ( ...args: any[] ) => any;
	depend?: {
		names: string[];
        //通过依赖值生成新的值
		handle: ( ...args: any[] ) => any;
	};
}
```

### 具体使用方法
> 详细代码可参考 apps/demo 项目

- 创建配置项列表
```typescript
export const RelationConfig: IConfigItem[] = [
	{
		name: "area",
		handle (val) { return [val]; }
	},
	{
		name: "region",
		handle async ( val: string[] ) => { return val?.filter( Boolean ); }
	}
];
// 处理函数支持 async/await 以及返回 Observable 的形式
// 如果你熟悉 RxJS 的话，那将会有很好的体验
```

- 通过包导出的 `ReGen` 方法获取 `AtomInOut` 方法
```typescript
const AtomInOut = ReGen( CacheKey, RelationConfig );
// 该工具通过 CacheKey 进行区分存储的状态，相同的 CacheKey 会获取相同的状态。
// 建议在组件外部进行调用，避免重复渲染。但是该函数做了缓存处理，写在组件里也不会造成性能浪费。
```

### 接下来可以使用hook进行操作

#### hook方法
- 通过使用 `@yhfu/ge-ren-hooks` 包导出的 `useAtomsValue` 以及 `useAtomsCallback` 方法，分别传入 `AtomInOut` 以及 `RelationConfig` 参数，hook会返回一个对象，通过解构对象，从而获取 `${name}` 以及 `${name}Callback`。其中 `${name}` 会被替换为 `RelationConfig` 中的name值。

```typescript
const AtomInOut = ReGen( CacheKey, RelationConfig );

const { area, region } = useAtomsValue( AtomInOut, RelationConfig );
const { areaCallback, regionCallback } = useAtomsCallback( AtomInOut, RelationConfig );
  
```