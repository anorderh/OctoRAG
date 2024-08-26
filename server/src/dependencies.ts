import { container } from "tsyringe";
import { InstanceDeps } from "./utils/enums/instance-deps";
import pino, { Logger, multistream } from "pino";
import * as fs from 'fs';
import { env } from "./env";
import path from "path";
import { includeIf } from "./utils/extensions/include-if";

export const instancedDependencies : {[id: string]: Function} = {
    [InstanceDeps.Logger]: () => {
        // Prepare log output (create dir if it doesn't exist)
        let timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        let logFilePath = `${env.pathes.logs}/${`log_${timestamp}.log`}`;
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

        // Create pino transport for logging to both console & file dest.
        let transport = pino.transport({
            targets: [
                includeIf(env.logging.toConsole, {   
                    target: 'pino-pretty'
                }),
                includeIf(env.logging.toFile, {
                    target: 'pino-pretty',
                    options: {
                        destination: `${env.pathes.logs}/${`log_${timestamp}.log`}`
                    }
                })
            ].filter(t => !!t)
        })

        // Inject instance.
        container.registerInstance<Logger>(InstanceDeps.Logger, pino({
            level: 'info',
            timestamp: pino.stdTimeFunctions.isoTime,
        }, transport))
    }
}