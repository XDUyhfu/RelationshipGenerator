import {
    CombineType,
    FilterNilStage,
    IConfigItem,
    ReGenPrefix
} from "../../../packages/Re-Gen/src/index";
import axios from "axios";

export const ParamsKey = "ParamsKey";
export const RequestKey = "RequestKey";
export const HandleRequstKey = "HandleRequstKey";

export const ParamsConfig: IConfigItem[] = [
    {
        name: "param1",
        filterNil: FilterNilStage.All,
        handle(v) {
            return v;
        },
    },
    {
        name: "param2",
        filterNil: FilterNilStage.All,
        handle(v) {
            return v;
        }
    },
    {
        name: "button",
        depend: {
            names: ["param1", "param2"],
            combineType: CombineType.SELF_CHANGE,
            handle: ([, param1, param2]) => ({
                    param1,
                    param2
                })
        }
    }
];

export const RequestConfig: IConfigItem[] = [
    {
        name: "result",
        init: `${ReGenPrefix}:${ParamsKey}:button`,
        handle(val) {
            if (val) {
                return axios.get(`https://api.github.com/users/${val?.param1 ?? "XDUyhfu"}`);
            }
        },
    },
];


