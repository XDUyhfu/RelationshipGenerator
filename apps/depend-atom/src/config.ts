import {
    CombineType,
    IConfigItem,
    ReGenPrefix
} from "../../../packages/Re-Gen/src/index";
import axios from "axios";

export const ParamsKey = "ParamsKey";
export const RequestKey = "RequestKey";

export const ParamsConfig: IConfigItem[] = [
    {
        name: "param1",
        init: "param1",
        handle(v) {
            return v;
        },
    },
    {
        name: "param2",
        handle(v) {
            return v;
        }
    },
    {
        name: "button",
        filterNil: true,
        depend: {
            names: ["param1", "param2"],
            combineType: CombineType.SELF_CHANGE,
            handle: ( [button, param1, param2] ) => ({
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
        }
    },
];
