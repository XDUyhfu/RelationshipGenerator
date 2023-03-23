import { BehaviorSubject } from "rxjs";

export const Atoms$ = new BehaviorSubject<any>(null);
export const CacheKey = Math.random().toString();
