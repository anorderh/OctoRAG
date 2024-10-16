import { dependencyMap } from "src/dependencies/dependency-map";
import { DependencyInjectionToken } from "../constants/dependency-injection-token";
import { container } from "tsyringe";

export async function instantiate(tokens: DependencyInjectionToken | DependencyInjectionToken[]) {
    if (!(tokens instanceof Array)) {
        tokens = [tokens];
    }

    for (let curr of tokens) {
        // Confirm handler exists.
        let handler = dependencyMap[curr];
        if (handler == null) {
            throw new Error(`No registration handler is associated with token "${curr}"`)
        }

        // Register.
        if (!container.isRegistered(curr)) {
            await handler();
        }
    }
}