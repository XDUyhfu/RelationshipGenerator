import { ReGen } from "@yhfu/re-gen";
import { RelationConfig } from "./config";
import { Button, Select } from "antd";
import { useAtoms } from "@yhfu/re-gen-hooks";

function App () {

  const AtomInOut = ReGen( "ca", RelationConfig );

  const {
    areaValue,
    regionValue,
    showRegionValue,
    RegionListValue,
    areaIn$,
    regionIn$,
    testMoreDependValue,
    testMoreDependIn$,
    testMoreMoreDependValue,
    testMoreMoreDependIn$
  } = useAtoms( AtomInOut, RelationConfig );

  return (
    <div >
      area: { JSON.stringify( areaValue ) }
      <br />
      region: { JSON.stringify( regionValue ) }
      <br />
      showRegion: { JSON.stringify( showRegionValue ) }
      <br />
      RegionList: { JSON.stringify( RegionListValue ) }
      <br />
      testMoreDependValue: { JSON.stringify( testMoreDependValue ) }
      <br />
      testMoreMoreDependValue: { JSON.stringify( testMoreMoreDependValue ) }
      <br></br>



      <Select
        // value={ areaValue?.[0] }
        style={ { width: 120 } }
        onChange={ ( val ) => { areaIn$.next( val ); } }
        placeholder={ "please enter sth." }
        options={ [
          {
            value: "JP",
            label: "日本",
          },
          {
            value: "CN",
            label: "中国",
          },
          {
            value: "KO",
            label: "韩国",
          },
        ] }
      />
      {
        showRegionValue ? <Select
          mode="multiple"
          style={ { width: 120 } }
          value={ regionValue }
          onChange={ ( val ) => { regionIn$.next( val ); } }
          options={ [
            {
              value: "HN",
              label: "河南",
            },
            {
              value: "SH",
              label: "上海",
            },
            {
              value: "BJ",
              label: "北京",
            },
            {
              value: "TJ",
              label: "天津",
            },
          ] }
        /> : null
      }
      <Button type='primary' onClick={ () => testMoreDependIn$.next( "true4" ) }>change More Depend State</Button>
      <Button type='primary' onClick={ () => testMoreMoreDependIn$.next( "out" ) }>change More More Depend State</Button>
    </div>
  );
}

export default App;
