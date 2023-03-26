import { useReValues } from "@yhfu/re-component";

export const Other = () => {
    const values = useReValues();
    return <div>{JSON.stringify(values)}</div>;
};
