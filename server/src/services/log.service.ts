import { container, injectable, singleton } from "tsyringe";
import pino, { Logger } from "pino";
import { InstanceDeps } from "../utils/enums/instance-deps";

@singleton()
export class LogService {
    res = (() => {
        container.registerInstance(InstanceDeps.Logger, pino({
            transport: {
                target: 'pino-pretty'
            }
        }));
    })()
}