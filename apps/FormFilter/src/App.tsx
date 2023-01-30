
import { Domain } from "./components/Domain";
import { Shortcut } from "./components/Time/Shortcut";
import { Time } from "./components/Time/Time";
import { Aggregation } from "./components/Time/Aggregation";
import { Area } from "./components/Area";
import { Region } from "./components/Region";
import { IP } from "./components/IP";
import styled from "styled-components";
import { Space } from "antd";
import { ReGen } from "@yhfu/re-gen";
import { CacheKey, RelationConfig } from "./config";
import { useAtoms } from "@yhfu/re-gen-hooks";
import { useCallback } from "react";

const Wrapper = styled( Space )`
  display: flex;
  flex-wrap: wrap;
  margin: 16px 0;
  > * {
    margin-bottom: 10px;
  }
`;

function App () {

  const AtomInOut = ReGen( CacheKey, RelationConfig );

  const {
    domainIn$,
    domainValue,
    timeIn$,
    timeValue,
    shortcutIn$,
    shortcutValue,
    aggregationIn$,
    aggregationValue,
    areaIn$,
    areaValue,
    regionIn$,
    regionValue,
    regionShowValue,
    RegionListValue,
    SelectableTimeRangeValue
  } = useAtoms( AtomInOut, RelationConfig );

  const domainChange = useCallback( ( domain: string[] ) => { domainIn$.next( domain ); }, [] );
  const timeChange = useCallback( ( _: any, time: string[] ) => {
    timeIn$.next( time );
    shortcutIn$.next( 0 );
  }, [] );
  const shortcutChange = useCallback( ( shortcut: any ) => { shortcutIn$.next( shortcut.target.value ); }, [] );
  const areaChange = useCallback( ( area: string ) => { areaIn$.next( area ); }, [] );
  const regionChange = useCallback( ( regions: string[] ) => { regionIn$.next( regions ); }, [] );
  const aggregationChange = useCallback( ( aggregation: string ) => { aggregationIn$.next( aggregation ); }, [] );

  console.log( RegionListValue );

  return (
    <>
      <Wrapper >
        <Domain value={ domainValue as string[] } change={ domainChange } />
        <Shortcut value={ shortcutValue as string } change={ shortcutChange } />
        <Time value={ timeValue as string[] } change={ timeChange } range={ SelectableTimeRangeValue as string[] } />
        <Aggregation value={ aggregationValue as string } change={ aggregationChange } />
        <Area value={ areaValue as string } change={ areaChange } />
        { regionShowValue ? <Region value={ regionValue as string[] } change={ regionChange } /> : null }
        {/* <IP value={ domainValue as string } change={ domainChange } /> */ }
      </Wrapper>
      <br />
      <br />
      <div>RegionListValue: { JSON.stringify( RegionListValue ) }</div>
    </>
  );
}

export default App;
