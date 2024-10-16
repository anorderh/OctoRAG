import { container } from "tsyringe";
import { UnsupportedError } from '../../error-handling/errors.js';
import { dependencyMap } from "src/dependencies/dependency-map.js";

export function EnsureDep(input: string | string[]): ClassDecorator {
    return (target: any) => {
        if (!(input instanceof Array)) {
            input = [input];
        }

        for (let curr of input) {
            // Confirm handler exists.
            let handler = dependencyMap[curr];
            if (handler == null) {
                throw new Error(`No registration handler is associated with token "${handler}"`)
            }

            // Register.
            if (!container.isRegistered(curr)) {
                handler();
            }
        }
    }
}