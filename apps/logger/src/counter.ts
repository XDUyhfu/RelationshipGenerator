import { fromEvent } from "rxjs";
import { getGroup } from "rxjs-watcher";

const watchInGroup = getGroup("Interval of even numbers", 60);

export function setupCounter(element: HTMLButtonElement) {
    let counter = 0;
    const setCounter = (count: number) => {
        counter = count;
        element.innerHTML = `count is ${counter}`;
    };
    element.addEventListener("click", () => setCounter(counter + 1));
    setCounter(0);

    // interval(2000)
    //     .pipe(
    //         watchInGroup("logger"),
    //         filter((item) => item % 2 === 0),
    //         watchInGroup("logger1")
    //     )
    //     .subscribe(setCounter);

    fromEvent(document, "click").pipe(watchInGroup("logger")).subscribe();
}
