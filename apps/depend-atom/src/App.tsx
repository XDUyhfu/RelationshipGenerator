import { useAtomsValue } from "../../../packages/Re-Gen/src/index";
import {
    FirstCacheKey,
    FirstConfig,
    SecondCacheKey,
    SecondConfig,
} from "./config";


function App() {
    const { atom, ReGenValues: { setValue } } = useAtomsValue(FirstCacheKey, FirstConfig);
    const { value } = useAtomsValue(SecondCacheKey, SecondConfig);

    return (
        <div>
            first: {JSON.stringify(atom)}
            <br />
            second: {JSON.stringify(value)}
            <br />
            <br />
            <button onClick={ setValue("atom") }>input first</button>
        </div>
    );
}

export default App;
