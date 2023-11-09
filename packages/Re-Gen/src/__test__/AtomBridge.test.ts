import { describe, expect, it, beforeAll } from "vitest";
import { AtomBridge } from "../utils";
import type { ReplaySubject } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { TestScheduler } from "rxjs/testing";

const key = "atom";

describe("AtomBridge", () => {
    let observable: ReplaySubject<any> | null = null;
    const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).deep.equal(expected);
    });

    beforeAll(() => {
        observable = AtomBridge.Instance().generate(key);
    });

    it("singleton", () => {
        expect(AtomBridge.Instance()).toEqual(AtomBridge.Instance());
    });

    it("generate", () => {
        expect(AtomBridge.Instance().getBridge(key)![0]).toEqual(observable);
    });

    it("subscribe", () => {
        const obser = new BehaviorSubject("test");
        AtomBridge.Instance().subscribe(key, obser);
        testScheduler.run((helpers) => {
            const { expectObservable } = helpers;
            const expected = "a";
            expectObservable(AtomBridge.Instance().getBridge(key)![0]).toBe(
                expected,
                { a: "test" },
            );
        });
    });
});
