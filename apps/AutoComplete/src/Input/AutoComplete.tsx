import Input from "./input";
import {
    useAtomsValue,
    useAtomsCallback,
} from "../../../../packages/Re-Gen/src";

import { ConfigList } from "./state";

const AutoComplete = () => {
    const { inputValue, list, hightIndex } = useAtomsValue("Test", ConfigList, { logger: true });
    const { keyCodeCallback, inputValueCallback } = useAtomsCallback(
        "Test",
        ConfigList, { logger: true }
    );

    const index = hightIndex % list?.length ?? 0;

    console.log(" list, hightIndex", list, hightIndex);

    return (
        <div>
            <Input
                value={inputValue}
                onChange={(value) => {
                    inputValueCallback(value);
                    keyCodeCallback("");
                }}
                onKey={keyCodeCallback}
            />
            {list?.map((item: { value: string }, idx: number) => (
                <>
                    <div
                        className={index === idx ? "bg-gray-500" : ""}
                        key={item.value}
                    >
                        {item.value}
                    </div>
                    <br></br>
                </>
            ))}
        </div>
    );
};

export default AutoComplete;
