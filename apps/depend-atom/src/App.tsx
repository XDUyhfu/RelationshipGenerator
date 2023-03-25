import {
    ReGen,
    useAtomsValue,
    useAtomsCallback,
} from "../../../packages/Re-Gen/src/index";
import {
    FirstCacheKey,
    FirstConfig,
    SecondCacheKey,
    SecondConfig,
} from "./config";

const first = ReGen(FirstCacheKey, FirstConfig, {
    logger: true,
    filterNil: "In",
});
const second = ReGen(SecondCacheKey, SecondConfig, {
    logger: true,
    filterNil: "In",
});

function App() {
    const { atom } = useAtomsValue(FirstCacheKey, first);
    const { atomCallback } = useAtomsCallback(FirstCacheKey, first);
    const { value } = useAtomsValue(SecondCacheKey, second);

    console.log(value);

    return (
        <div>
            first: {JSON.stringify(atom)}
            <br />
            second: {JSON.stringify(value)}
            <br />
            <br />
            <button onClick={atomCallback}>input first</button>
        </div>
    );
}

export default App;
