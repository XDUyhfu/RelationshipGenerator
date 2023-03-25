import { Button, Input, Switch } from "antd";
import {
    ReGen,
    useAtomsCallback,
    useAtomsValue,
} from "../../../packages/Re-Gen/src/index";

import { Config } from "./config";

const key = "CACHE_KEY_STATE_EXTENSION";
const AtomInOut = ReGen(key, Config, {
    logger: true,
    // filterNil: "In"
});

function App() {
    const { result } = useAtomsValue(key, AtomInOut);
    const { inputValueCallback, addCallback } = useAtomsCallback(
        key,
        AtomInOut
    );

    return (
        <div>
            <div>{JSON.stringify(result)}</div>
            <div>{JSON.stringify(Array.isArray(result))}</div>
            {result?.map(
                (item: { value: string; id: string }, index: number) => (
                    <div key={item.id}>
                        <Input
                            value={item.value}
                            onChange={(val) => {
                                inputValueCallback({
                                    index,
                                    value: val.target.value,
                                });
                            }}
                            width="300px"
                        ></Input>
                        <Switch checked></Switch>
                    </div>
                )
            )}

            <br />
            <br />
            <Button type="primary" onClick={addCallback}>
                添加
            </Button>
        </div>
    );
}

export default App;
