import { describe, expect, it, beforeAll } from "vitest";
import { TestScheduler } from "rxjs/testing";
import { CombineType } from "../config.ts";
import { ReGen } from "../Builder.ts";
import type { IAtomInOut } from "../type";
import { isObservable } from "rxjs";

const CacheKey = "CacheKey";
export const ParamsConfig = [
    {
        name: "param1",
        init: "param1",
    },
    {
        name: "param2",
    },
    {
        name: "button",
        filterNil: true,
        depend: {
            names: ["param1", "param2"],
            combineType: CombineType.SELF_CHANGE,
            handle: ([_, param1]: any) => ({
                param1,
                // param2,
            }),
        },
    },
];

describe("Atom", () => {
    let re_gen: IAtomInOut | null = null;
    const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).deep.equal(expected);
    });

    beforeAll(() => {
        re_gen = ReGen(CacheKey, ParamsConfig);
    });

    it("isObservable", () => {
        const button$ = re_gen?.("button")["buttonOut$"];
        expect(isObservable(button$)).toEqual(true);
    });

    it("click button", () => {
        testScheduler.run((helpers) => {
            const { expectObservable } = helpers;
            const expected = "a";
            const button_in$ = re_gen?.("button")["buttonIn$"];
            // button_in$?.next({});
            expectObservable(button_in$!).toBe(expected, {
                a: { param1: "param1" },
            });
        });
    });
});
