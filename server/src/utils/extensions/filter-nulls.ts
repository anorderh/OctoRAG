export function filterNulls(inputObj: any) {
    for (let prop of Object.keys(inputObj)) {
        if (inputObj[prop] == null) {
            delete inputObj[prop];
        }
    }
    return inputObj;
}