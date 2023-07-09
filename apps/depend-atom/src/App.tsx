import { useReGen } from "../../../packages/Re-Gen/src/index";
import {
    FirstCacheKey,
    FirstConfig,
    SecondCacheKey,
    SecondConfig,
} from "./config";


function App() {
    const { atom, ReGenValues: { setValue } } = useReGen(FirstCacheKey, FirstConfig);
    const { value } = useReGen(SecondCacheKey, SecondConfig);

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
