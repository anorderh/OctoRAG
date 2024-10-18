export function assert(input: any, func: Function) : string {
    func(input);
    return input;
}