import Input from "./input";
import { ReGen } from "../../../../packages/Re-Gen/src/index";
import {
    useAtomsValue,
    useAtomsCallback,
} from "../../../../packages/Re-Gen-Hooks/src/hooks/index";
import { ConfigList } from "./state";

const AtomInOut = ReGen("Test", ConfigList, {logger: true,});

const AutoComplete = () => {
    const { inputValue, list, hightIndex } = useAtomsValue(
        AtomInOut,
        ConfigList
    );
    const { keyCodeCallback, inputValueCallback } = useAtomsCallback(
        AtomInOut,
        ConfigList
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
