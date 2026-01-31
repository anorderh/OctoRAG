export function limitStringLength(obj: any, length: number = 100) {
    return Object.keys(obj).reduce((res: any, key) => {
        let val = obj[key];
        res[key] = typeof val === "string"
            ? val.slice(0, length)
            : val;

        return res;
    }, {})
}