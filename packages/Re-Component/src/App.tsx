import { IConfigItem } from "@yhfu/re-gen";
import { ReContainer } from "./components/re-container";
import { ReField } from "./components/re-field";
import { Input } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { setValueByName } from "./utils";

const RelationConfig: IConfigItem[] = [
  {name: "input1"},
  {name: "input2"},
  {name: "input3"},
  {name: "input4"},
  {name: "input5"},
];

function App() {
  return (
      <ReContainer config={RelationConfig}>
        <ReField name="input1" defaultValue={ "123" } onChange={ ( setter, value ) => { 
          setValueByName("input2", 666);
          setValueByName("input1", value);
        } }><Input /></ReField>
        <ReField name="input2" defaultValue={"123"}><Input style={{width: 500}}/></ReField>
        <ReField name="input3" defaultValue={"123"}><Input /></ReField>
        <ReField name="input4" defaultValue={"123"}><Input /></ReField>
        <ReField name="input5" defaultValue={"123"}><Input /></ReField>
     </ReContainer>
  );
}

export default App;
