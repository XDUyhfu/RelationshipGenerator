import { BehaviorSubject } from "rxjs";
import {
	useEffect,
	useState
} from "react";

import {
	getOutObservable,
	setValue
} from "@yhfu/re-gen";
import { CacheKey } from "../context";

// export const useRestProps = (
//     props: Record<string, string>,
//     children: React.ReactElement
// ) => {
//     const propsWithoutReInject = {} as Record<string, any>;
//     Object.keys(props).map((item) => {
//         if (item.startsWith("re-inject-")) {
//             const propName = item.replace("re-inject-", "") as string;
//             if (!(propName.length > 0)) {
//                 throw Error("无效的 re-inject-* 属性");
//             }
//             if (typeof children.props[propName] !== "function") {
//                 throw Error("re-inject-* 属性只能用于函数属性");
//             }
//             const value = useAtom(props[item])[0];
//             console.log(value);
//             propsWithoutReInject[propName] = useCallback(
//                 (...args: any[]) => {
//                     children.props[propName](value, ...args);
//                 },
//                 [value]
//             );
//         } else {
//             propsWithoutReInject[item] = props[item];
//         }
//     });
//
//     const restPropsWithRe = {} as Record<string, any>;
//     Object.keys(propsWithoutReInject).map((item) => {
//         if (item.startsWith("re-")) {
//             restPropsWithRe[`${item.slice(3)}`] = useAtom(
//                 (propsWithoutReInject as Record<string, string>)[item]
//             )[0];
//         }
//     });
//     const restPropsWithoutRe = {} as Record<string, any>;
//     Object.keys(propsWithoutReInject).map((item) => {
//         if (!item.startsWith("re-")) {
//             restPropsWithoutRe[item] = (
//                 propsWithoutReInject as Record<string, string>
//             )[item];
//         }
//     });
//     return { ...restPropsWithoutRe, ...restPropsWithRe };
// };

/**
 * 根据传入的 visible 进行判断，如果是 boolean 类型则直接返回，如果是 string 类型，则订阅对应的 Observable
 * @param visible
 */
export const useVisible = (visible: boolean | string) => {
	let visibleObservable: boolean | null | BehaviorSubject<any> = typeof visible === "string" ? null : visible;
	if (typeof visible === "string") {
		visibleObservable = getOutObservable(CacheKey, visible);
	}
	// if (isNil(visibleObservable)) {
	// 	throw new Error("传入的 visible 不正确");
	// }
	const [vis, setVis] = useState(visibleObservable);
	useEffect(() => {
		if (typeof visibleObservable === "boolean") {
			setVis(visibleObservable);
		} else {
			if (visibleObservable) {
				visibleObservable.subscribe(setVis);
			}
		}
	}, []);
	return vis;
};

export const useReValue = (name: string) => {
	const [val, setVal] = useState<any>();
	const valueObservable = getOutObservable(CacheKey, name);
	const setter = setValue(CacheKey, name);
	useEffect(() => {
		if (valueObservable) {
			valueObservable.subscribe(setVal);
		}
	}, []);
	return [val, setter];
};
