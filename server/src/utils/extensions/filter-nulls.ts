export function filterNulls(inputObj: any) {
    return (Object.keys(inputObj) as any[]).reduce((res: any, key: string) => {
        let val = inputObj[key];
        if (val != null) {
            res[key] = val;
        }
        return res;
    })
}