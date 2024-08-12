import { container } from "tsyringe";
import { instancedDependencies } from "../../utils/extensions/instance-deps";
import { MissingCustomDependencyHandler } from "../../utils/extensions/error-extension-library";

export function EnsureDep(input: string | string[]): ClassDecorator {
    return (target: any) => {
        if (!(input instanceof Array)) {
            input = [input];
        }

        for (let curr of input) {
            // Confirm handler exists.
            let handler = instancedDependencies[curr];
            if (handler == null) {
                throw new MissingCustomDependencyHandler(
                    `No registration handler is associated with token "${handler}"`
                );
            }

            // Register.
            if (!container.isRegistered(curr)) {
                handler();
            }
        }
    }
}