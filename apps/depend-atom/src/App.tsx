import { ReGen } from "../../../packages/Re-Gen/src/index";
import {
    useAtomsValue,
    useAtomsCallback,
} from "../../../packages/Re-Gen-Hooks/src/hooks/index";
import {
    FirstCacheKey,
    FirstConfig,
    SecondCacheKey,
    SecondConfig,
} from "./config";

const first = ReGen(FirstCacheKey, FirstConfig, {
    logger: true,
    filterNil: "all",
});
const second = ReGen(SecondCacheKey, SecondConfig, {
    logger: true,
    filterNil: "all",
});

function App() {
    const { atom } = useAtomsValue(first, FirstConfig);
    const { atomCallback } = useAtomsCallback(first, FirstConfig);
    const { value } = useAtomsValue(second, SecondConfig);

    console.log(value);

    return (
        <div>
            first: {JSON.stringify(atom)}
            <br />
            {/*second: {JSON.stringify(value)}*/}
            <br />
            <br />
            <button onClick={atomCallback}>input first</button>
        </div>
    );
}

export default App;
