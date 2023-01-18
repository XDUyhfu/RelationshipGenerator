## 基于rxjs的依赖关系生成器

> 初期开发阶段，API不稳定，谨(不)慎(用)使(也)用(行)！

> 此库不定时更新

有个简单的想法，就是将数据处理和组件进行分开管理。为了实现这个想法，目前就是将数据和其处理的函数通过配置文件的方式进行声明。但是简单的声明并不能很好的满足开发的需求，因此还需要能够处理数据之间的依赖关系等等。为此，通过使用RxJS提供的合并类操作符等，进行数据依赖的处理。

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
```ts
export const RelationConfig: IConfigItem[] = [
	{
		name: "area",
		handle (val) { return [val]; }
},
	{
		name: "region",
		handle ( val: string[] ) { return val?.filter( Boolean ); }
	},
	{
		name: "showRegion",
		init: false,
		depend: {
			names: ["area"],
			handle ( [show, area]:[show:boolean, area:string[]] ) {
				if ( area?.includes( "CN" ) ) {
					return true;
				}
				return false;
			}
		}
	},
	{
		name: "RegionList",
		init: [],
		depend: {
			names: ["area", "region"],
			handle ( [list, area, region]:[list: string[], area: string[], region: string[]] ) {
				if ( area?.includes( "CN" ) ) {
					return region?.filter(Boolean)?.map( item => ( {
						name: item,
						region: item
					} ));
				} else {
					return area?.filter(Boolean)?.map( item => ( {area: item} ));
				}
			}
		}
	}
];
```

- 通过导出的 `ReGen` 方法获取 `AtomInOut` 方法
```ts
const AtomInOut = ReGen( RelationConfig );
```

### 接下来可以使用常规方法或者是hook进行操作

#### 常规方法

- 通过 AtomInOut 方法获取操作数据的对象(In$, Out$)
```ts
const { areaIn$, areaOut$ } = AtomInOut( "area" );

// areaOut$ 为 Observable<T> 类型的对象，可以通过 rxjs-hooks 中的 useObservable hook 进行订阅
const area = useObservable( () => areaOut$ );
// 返回的值可以直接在 DOM 中进行展示
// <div>
// 	{ JSON.stringify( area ) }
// </div>

// areaIn$ 为 Subject<T> 类型的对象，可以通过自身的 next 方法发送值
<Select
	value={ area?.[0] }
	style={ { width: 120 } }
	onChange={ ( val ) => { areaIn$.next( val ); } }
	placeholder={ "please enter sth." }
	options={ [
	{
		value: "JP",
		label: "日本",
	},
	{
		value: "CN",
		label: "中国",
	},
	{
		value: "KO",
		label: "韩国",
	},
	] }
/>
```
#### hook
- 通过使用 `@yhfu/ge-ren-hooks` 包导出的 `useAtoms` 方法，分别传入 `AtomInOut` 以及 `RelationConfig` 参数，hook会返回一个对象，通过解构对象，从而获取 `${name}Value` 以及 `${name}In$`。其中 `${name}` 会被替换为 `RelationConfig` 中的name值。


