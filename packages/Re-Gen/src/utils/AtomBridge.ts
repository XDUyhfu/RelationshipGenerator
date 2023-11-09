import type { Observable } from "rxjs";
import { ReplaySubject } from "rxjs";

export class AtomBridge {
    private bridge = new Map<string, ReplaySubject<any>[]>();
    private static instance: null | AtomBridge = null;

    private constructor() {}

    static Instance() {
        if (this.instance) return this.instance;
        this.instance = new AtomBridge();
        return this.instance;
    }

    generate(key: string) {
        const observable = new ReplaySubject(0);
        this.bridge.set(key, [...(this.bridge.get(key) ?? []), observable]);
        return observable;
    }

    /**
     * 统一去订阅一个 observable
     */
    subscribe(key: string, observable: Observable<any>) {
        this.bridge.has(key) &&
            this.bridge.get(key)!.forEach((o) => observable.subscribe(o));
    }

    getBridge(key: string) {
        return this.bridge.get(key);
    }
}
