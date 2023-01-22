import { ReGen } from "@yhfu/re-gen";
import { RelationConfig } from "./config";
import { Button, Select } from "antd";
// import { useAtoms } from "@yhfu/re-gen-hooks";
import { useEventCallback, useObservable } from "rxjs-hooks";
import { map } from "rxjs";

function App () {

  const AtomInOut = ReGen( "CACHE_KEY", RelationConfig );

  const { areaIn$, areaOut$ } = AtomInOut<string>( "area" );
  const areaValue = useObservable( () => areaOut$ );
  const [areaCallback] = useEventCallback( ( event$ ) => event$.pipe(
    map( ( val ) => areaIn$.next( val ) )
  ) );

  const { regionIn$, regionOut$ } = AtomInOut<string>( "region" );
  const regionValue = useObservable( () => regionOut$ );
  const [regionCallback] = useEventCallback( ( event$ ) => event$.pipe(
    map( ( val ) => regionIn$.next( val ) )
  ) );

  const { showRegionOut$ } = AtomInOut<boolean>( "showRegion" );
  const showRegionValue = useObservable( () => showRegionOut$ );

  const { RegionListIn$, RegionListOut$ } = AtomInOut<string[]>( "RegionList" );
  const RegionListValue = useObservable( () => RegionListOut$ );

  const { testMoreDependIn$, testMoreDependOut$ } = AtomInOut<string>( "testMoreDepend" );
  const testMoreDependValue = useObservable( () => testMoreDependOut$ );
  const [testMoreDependCallback] = useEventCallback( ( event$ ) => event$.pipe(
    map( ( val ) => testMoreDependIn$.next( val ) )
  ) );

  const { testMoreMoreDependIn$, testMoreMoreDependOut$ } = AtomInOut<string>( "testMoreMoreDepend" );
  const testMoreMoreDependValue = useObservable( () => testMoreMoreDependOut$ );
  const [testMoreMoreDependCallback] = useEventCallback( ( event$ ) => event$.pipe(
    map( ( val ) => testMoreMoreDependIn$.next( "out" ) )
  ) );

  // const { areaIn$, areaOut$ } = AtomInOut( "area" );
  // const areaValue = useObservable( () => areaOut$ );
  // const [callback] = useEventCallback( ( event$ ) => event$.pipe(
  //   map( ( val ) => areaIn$.next( val ) )
  // ) );

  // const {
  // areaValue,
  // regionValue,
  // showRegionValue,
  // RegionListValue,
  // areaIn$,
  // regionIn$,
  // testMoreDependValue,
  // testMoreDependIn$,
  // testMoreMoreDependValue,
  // testMoreMoreDependIn$
  // } = useAtoms( AtomInOut as any, RelationConfig );



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
        // value={ areaValue as any }
        style={ { width: 120 } }
        onChange={ areaCallback }
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
          onChange={ regionCallback }
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
      <Button type='primary' onClick={ testMoreDependCallback }>change More Depend State</Button>
      <Button type='primary' onClick={ testMoreMoreDependCallback }>change More More Depend State</Button>
    </div>
  );
}

export default App;
