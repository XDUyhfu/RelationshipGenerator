import { DatePicker } from "antd";
import dayjs from "dayjs";
import { DateFormat } from "../../config";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend( isBetween );

const { RangePicker } = DatePicker;

export const Time = ( { value, change, range }: { value: string[], change: ( ...args: any[] ) => void; range: string[]; } ) =>
    <RangePicker
        showTime
        format={ DateFormat }
        disabledDate={ ( date ) => !date.isBetween( range?.[0], range?.[1] ) }
        value={ [dayjs( value?.[0] ), dayjs( value?.[1] )] }
        onChange={ change } />;

