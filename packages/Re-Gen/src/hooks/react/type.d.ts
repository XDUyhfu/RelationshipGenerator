import type { IConfigItem } from '@yhfu/re-gen';
import type { BehaviorSubject } from 'rxjs';

type FlatConfigList<
    ConfigList extends readonly IConfigItem[] | IConfigItem[][]
> = ConfigList extends readonly IConfigItem[]
    ? ConfigList
    : ConfigList extends [
          infer First extends readonly IConfigItem[],
          ...infer Rest extends IConfigItem[][]
      ]
    ? [...First, ...FlatConfigList<Rest>]
    : [];

type ConfigListNames<ConfigList extends readonly IConfigItem[]> =
    ConfigList extends readonly [
        infer Item extends IConfigItem,
        ...infer Rest extends IConfigItem[]
    ]
        ? Item['name'] | ConfigListNames<Rest>
        : never;

type IResultAtomsValue<
    ConfigList extends readonly IConfigItem[] | IConfigItem[][] = []
> = {
    [Key in ConfigListNames<FlatConfigList<ConfigList>>]: unknown;
} & {
    ReGenValue: {
        getValue: {
            (): Record<string, any>;
            (name: string): any;
        };
        setValue: {
            (name: string): (value: any) => void;
            (name: string, value: any): void;
        };
    };
    ReGenObservable: {
        getInObservable: {
            (): Record<string, BehaviorSubject<any>>;
            (name: string): BehaviorSubject<any>;
        };
        getOutObservable: {
            (): Record<string, BehaviorSubject<any>>;
            (name: string): BehaviorSubject<any>;
        };
    };
};

type IResultRecordAtomsValue<
    RecordConfigItem extends Record<
        string,
        IConfigItem[] | IConfigItem[][]
    > = NonNullable<unknown>
> = {
    [K in keyof RecordConfigItem]: {
        [y: `${string}`]: any;
        ReGenValue: {
            getValue: {
                (): Record<string, any>;
                (name: string): any;
            };
            setValue: {
                (name: string): (value: any) => void;
                (name: string, value: any): void;
            };
        };
        ReGenObservable: {
            getInObservable: {
                (): Record<string, BehaviorSubject<any>>;
                (name: string): BehaviorSubject<any>;
            };
            getOutObservable: {
                (): Record<string, BehaviorSubject<any>>;
                (name: string): BehaviorSubject<any>;
            };
        };
    };
};

type ReGenHookConfig = {
    destroyOnExit?: boolean;
};
