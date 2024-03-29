import { CombineType, JointState } from "../../../Re-Gen/src";

export const ParamsKey = "ParamsKey";
export const RequestKey = "RequestKey";

export const ParamsConfig = [
    {
        name: "param1",
        init: "param1",
        handle(val: any) {
            console.log(val);
            return val;
        },
    },
    {
        name: "param2",
    },
    {
        name: "button",
        filterNil: true,
        depend: {
            names: ["param1", "param2"],
            combineType: CombineType.SELF_CHANGE,
            handle: ([_, param1, param2]: any) => {
                return {
                    param1,
                    param2,
                };
            },
        },
    },
] as const;

export const RequestConfig = [
    {
        name: "result",
        init: JointState(ParamsKey, "button"),
        handle(val: any) {
            if (val) {
                console.log("val -- ", val);
                // return axios.get(
                //     "http://127.0.0.1:4523/m1/2692195-0-default/json",
                // );
                return val;
            }
        },
    },
] as const;
