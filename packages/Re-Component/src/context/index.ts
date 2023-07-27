import { IConfigItem } from "@yhfu/re-gen";
import { BehaviorSubject } from "rxjs";
import { createContext } from "react";

export const CacheKey = "ReComponent-CacheKey";
export const ReFormContext = createContext<Record<string, any>>({});

// export const Atoms$ = new BehaviorSubject<any>(null);
// export const Config$ = new BehaviorSubject<IConfigItem[]>([]);
//
// export const ReValues = new BehaviorSubject({});
