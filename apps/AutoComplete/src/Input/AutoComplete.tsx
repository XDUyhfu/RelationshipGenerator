import Input from "./input";
import { useAtomsValue, ReGenRegisterConfig } from "../../../../packages/Re-Gen/src";

import { ConfigList } from "./state";

ReGenRegisterConfig("Test", { logger: true });

const AutoComplete = () => {
    const { inputValue, list, hightIndex, ReGenValues: { setValue } } = useAtomsValue("Test", ConfigList);

    const index = hightIndex % list?.length ?? 0;

    console.log(" list, hightIndex", list, hightIndex);

    return (
        <div>
            <Input
                value={inputValue}
                onChange={(value) => {
                    setValue("inputValue", value);
                    setValue("keyCode", "");
                }}
                onKey={setValue("keyCode")}
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
