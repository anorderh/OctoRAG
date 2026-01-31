import { DependencyInjectionToken } from "../constants/dependency-injection-token";
import { container } from "tsyringe";

export function instantiate<T = void>(token: DependencyInjectionToken, func: Function) {
    return async (params: T) => {
        if (!container.isRegistered(token)) {
            await func(params);
        }
    }
}