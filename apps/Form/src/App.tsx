import { ReGen } from "@yhfu/re-gen";
import React from "react";
import { ConfigItems } from "./config";
import { useAtomsValue ,useAtomsCallback } from "@yhfu/re-gen-hooks";
import { Button } from "antd";


const AtomInOut = ReGen( "FORM_CACHE_KEY", ConfigItems );

const App: React.FC = () => {
  const { Items, ItemNames } = useAtomsValue( AtomInOut, ConfigItems );
  const { addItemCallback } = useAtomsCallback( AtomInOut, ConfigItems );

  return <div>

    { JSON.stringify( Items ) }
    <br />
    { JSON.stringify( ItemNames ) }
    <br />


    <Button onClick={addItemCallback}>添加</Button>

  </div>;
};

export default App;
