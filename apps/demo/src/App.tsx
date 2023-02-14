import { ReGen } from "@yhfu/re-gen";
import { RelationConfig } from "./config";
import { Select } from "antd";
import { useAtomsCallback, useAtomsValue } from "@yhfu/re-gen-hooks";

function App () {

  const AtomInOut = ReGen( "CACHE_KEY", RelationConfig );

  const { area, region, showRegion, RegionList, testMoreDepend, testMoreMoreDepend } = useAtomsValue( AtomInOut, RelationConfig );
  const { areaCallback, regionCallback } = useAtomsCallback( AtomInOut, RelationConfig );

  return (
    <div >
      <div>areaValue: { JSON.stringify( area ) }</div>
      <div>regionValue: { JSON.stringify( region ) }</div>
      <div>showRegionValue: { JSON.stringify( showRegion ) }</div>
      <div>RegionListValue: { JSON.stringify( RegionList ) }</div>
      <div>testMoreDependValue: { JSON.stringify( testMoreDepend ) }</div>
      <div>testMoreMoreDependValue: { JSON.stringify( testMoreMoreDepend ) }</div>

      <br />

      <Select
        style={ { width: 120 } }
        onChange={ areaCallback }
        placeholder="area"
        options={ [
          { value: "AP1", label: "亚太1区" },
          { value: "AP2", label: "亚太2区" },
          { value: "CN", label: "中国大陆" }
        ] }
      />

      <br />

      {
        showRegion ? <Select
          mode="multiple"
          allowClear
          style={ { width: 120 } }
          placeholder="region"
          onChange={ regionCallback }
          options={ [
            { value: "BJ", label: "北京" },
            { value: "SH", label: "上海" },
            { value: "GZ", label: "广州" },
            { value: "SZ", label: "深圳" }
          ] }
        /> : null
      }
    </div>
  );
}

export default App;
