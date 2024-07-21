import { injectable, singleton } from "tsyringe";
import pino, { Logger } from "pino";

@singleton()
export class LogService {
    logger: Logger;

    constructor() {
        this.logger = pino({
            transport: {
                target: 'pino-pretty'
            }
        })
    }

    trace = (input: any) => this.logger.trace(input);
    debug = (input: any) => this.logger.debug(input);
    info = (input: any) => this.logger.info(input);
    warn = (input: any) => this.logger.warn(input);
    error = (input: any) => this.logger.error(input);
    fatal = (input: any) => this.logger.fatal(input);
}