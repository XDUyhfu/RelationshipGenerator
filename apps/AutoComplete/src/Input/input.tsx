import {
    ChangeEvent,
    KeyboardEvent,
    useState
} from "react";


interface InputProps {
    value: string;
    onChange: ( value: string ) => void;
    onKey: ( value: any ) => void;
}

const Input: React.FC<InputProps> = ( {
    onChange,
    onKey,
    value
} ) => {
    const [inputValue, setInputValue] = useState<string>( value || "" );

    const handleChange = ( e: ChangeEvent<HTMLInputElement> ) => {
        setInputValue( e.target.value );
        onChange( e.target.value );
    };

    const handleKeyDown = ( e: KeyboardEvent<HTMLInputElement> ) => {
        onKey( e.code );
    };

    return <>
        <input placeholder='input sth.' onKeyDown={ handleKeyDown } className='border px-3' type="text"
               value={ inputValue } onChange={ handleChange }/>
        <ul>

        </ul>
    </>;
};

export default Input;
