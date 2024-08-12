import { container } from "tsyringe";
import { InstanceDeps } from "../enums/instance-deps";
import pino, { Logger } from "pino";

export const instancedDependencies : {[id: string]: Function} = {
    [InstanceDeps.Logger]: () => {
        container.registerInstance<Logger>(InstanceDeps.Logger, pino({
            transport: {
                target: 'pino-pretty'
            }
        }))
    }
}