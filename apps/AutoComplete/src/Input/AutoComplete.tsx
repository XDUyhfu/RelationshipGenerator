import Input from "./input";
import { ReGen } from "@yhfu/re-gen";
import {
	useAtomsValue,
	useAtomsCallback
} from "@yhfu/re-gen-hooks";
import { ConfigList } from "./state";


const AtomInOut = ReGen( "Test", ConfigList );

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AutoCompleteProps {
}

const AutoComplete: React.FC<AutoCompleteProps> = ( {} ) => {

	const {
		inputValue,
		list
	} = useAtomsValue( AtomInOut, ConfigList );
	const {
		keyCodeCallback,
		inputValueCallback
	} = useAtomsCallback( AtomInOut, ConfigList );

	return <div>
		<Input value={ inputValue } onChange={ ( value ) => {
			inputValueCallback( value );
			keyCodeCallback( "" );
		} } onKey={ keyCodeCallback }/>
		{ list.map( ( item: { value: string } ) => <>
			<div key={ item.value }>{ item.value }</div>
			<br></br></> ) }
	</div>;
};


export default AutoComplete;
