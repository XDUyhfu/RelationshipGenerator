import { IConfigItem } from "@yhfu/re-gen";
import { BehaviorSubject } from "rxjs";

export const Atoms$ = new BehaviorSubject<any>(null);
export const Config$ = new BehaviorSubject<IConfigItem[]>([]);
export const CacheKey = Math.random().toString();
