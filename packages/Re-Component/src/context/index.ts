import { createContext } from "react";

export const CacheKey = "ReComponent-CacheKey";
export const ReFormContext = createContext<Record<string, any>>({});
