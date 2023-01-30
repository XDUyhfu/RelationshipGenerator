import { ReGen } from "@yhfu/re-gen";
import { RelationConfig } from "./config";
import { Select } from "antd";
import { useAtoms } from "@yhfu/re-gen-hooks";
import { useCallback } from "react";

function App () {

  const AtomInOut = ReGen( "CACHE_KEY", RelationConfig );

  const {
    areaIn$,
    areaValue,
    regionIn$,
    regionValue,
    showRegionValue,
    RegionListValue,
    testMoreDependIn$,
    testMoreDependValue,
    testMoreMoreDependIn$,
    testMoreMoreDependValue
  } = useAtoms( AtomInOut, RelationConfig );

  const areaCallback = useCallback( ( area: string ) => { areaIn$.next( area ); }, [] );
  const regionCallback = useCallback( ( regions: string[] ) => { regionIn$.next( regions ); }, [] );

  return (
    <div >
      <div>areaValue: { JSON.stringify( areaValue ) }</div>
      <div>regionValue: { JSON.stringify( regionValue ) }</div>
      <div>showRegionValue: { JSON.stringify( showRegionValue ) }</div>
      <div>RegionListValue: { JSON.stringify( RegionListValue ) }</div>
      <div>testMoreDependValue: { JSON.stringify( testMoreDependValue ) }</div>
      <div>testMoreMoreDependValue: { JSON.stringify( testMoreMoreDependValue ) }</div>

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
        showRegionValue ? <Select
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
