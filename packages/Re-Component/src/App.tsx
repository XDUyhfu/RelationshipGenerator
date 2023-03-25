import { IConfigItem } from "@yhfu/re-gen";
import { Button, Input } from "@arco-design/web-react";
import "@arco-design/web-react/dist/css/arco.css";
import { delay, map, of } from "rxjs";
import { useState } from "react";
import { updateValueByName, ReComponent } from "./utils";

const RelationConfig: IConfigItem[] = [
    { name: "input1" },
    { name: "input2" },
  {
    name: "input3", handle ( val ) {
      updateValueByName("range", [val]);
      return val;
    } 
},
    { name: "input4" },
  { name: "input5" },
  {
    name: "show",
    init: false,
    handle: (val) => of(val).pipe(delay(1000), map(() => true))
  },
  {
    name: "range",
    init: [],
    depend: {
      names: ["input1"],
      handle ([range, input1]) {
      return [...range, input1];
    }
  }
  }
];

const { ReContainer, ReField, useReValue } = ReComponent(RelationConfig);

function App () {
  const [vis, setVis] = useState( false );
  const value = useReValue();
    return (
        <ReContainer>
            <ReField
                name="input1"
                defaultValue={"123"}
                re-range={"range"}
            >
                <Input />
            </ReField>
            <ReField name="input2" defaultValue={"123"}>
                <Input />
            </ReField>
            <ReField name="input3" defaultValue={"123"}>
                <Input />
            </ReField>
            <ReField name="input4" visible={vis} defaultValue={"show"}>
                <Input />
            </ReField> 
            <Button type="primary" onClick={ () => { setVis(true); } }>show me</Button> 
        </ReContainer>
    );
}

export default App;
