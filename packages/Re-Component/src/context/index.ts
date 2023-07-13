import { IConfigItem } from "@yhfu/re-gen";
import { BehaviorSubject } from "rxjs";

export const CacheKey = "ReComponent-CacheKey";

export const Atoms$ = new BehaviorSubject<any>(null);
export const Config$ = new BehaviorSubject<IConfigItem[]>([]);

export const ReValues = new BehaviorSubject({});
