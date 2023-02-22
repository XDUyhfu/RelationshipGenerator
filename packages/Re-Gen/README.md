# 基于rxjs的状态生成器

**NPM地址** [@yhfu/re-gen](https://www.npmjs.com/package/@yhfu/re-gen)  [@yhfu/re-gen-hooks](https://www.npmjs.com/package/@yhfu/re-gen-hooks)

> 初期开发阶段，API不稳定，谨(不)慎(用)使(也)用(行)！

> 此库不定时更新

✨🌟✨🌟✨🌟 ***依然存在很多问题，但是会尽快解决他们*** 🌟✨🌟✨🌟✨

## 为什么会有该库
> 有个简单的想法，就是将状态处理和组件UI分开进行管理。为了实现这个想法，目前就是将状态和其处理的函数通过配置文件的方式进行声明。但是简单的声明并不能很好的满足开发的需求，因此还需要能够处理数据之间的依赖关系等等。为此，通过使用RxJS提供的合并类操作符等，进行数据依赖的处理。所以就诞生了这个小工具。

## 什么场景适合使用？
> 其实它可以应用到平时开发中的任何场景，只是不同场景的接入成本不同。
### apps/FormFilter
这是一个实际的demo，你会发现在这种场景下工具使用起来会非常的丝滑，因为这个工具的诞生就是为了这种场景的需求。它主要以多个不同的field之间进行联动。其次就是比较关键的地方在于它们的数据源都来自于组件，包括 change click 等进行驱动，这也是RxJS能适用的原因之一。 
### app/Form
这是一个非常规的demo，主要展示的是一个数据是通过其他数据源驱动更新自身（reduce）的一个场景。因为RxJS自身的原因，并不能很好的区分到底是哪个依赖产生了变化，所以需要写一些功能性（例如去重）之类的代码，或者是引入新的变量来标识具体是哪个变量发生了变化（类似于redux派发action）。


如果使用该工具，需要提供一组配置项，单个配置项的格式如下所示，具体使用方式可以参照 apps/demo/src/config.ts 的配置文件。

```typescript
export interface IConfigItem {
	name: string;
	init?: any;
    // 对当前值进行处理
	handle?: ( arg: any ) => any;
	depend?: {
		names: string[];
        //通过依赖值生成新的值
		handle: ( args: any[] ) => any;
		reduce?: (pre: any, cur: any) => any
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