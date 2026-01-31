import * as fs from 'fs';
import path from 'path';
import pino, { Logger } from 'pino';
import { env } from 'src/shared/constants/env';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupPino = instantiate(
    DependencyInjectionToken.Pino,
    async function () {
        let timestamp = new Date().toISOString().replace(/[:.-]/g, '_');
        let logFilePath = `${env.pathes.logs}/${`log_${timestamp}.log`}`;
        fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

        // Create pino transport for logging to both console & file dest.
        let transport = pino.transport({
            targets: [
                env.logging.toConsole
                    ? {
                          target: 'pino-pretty',
                      }
                    : null,
                env.logging.toFile
                    ? {
                          target: 'pino-pretty',
                          options: {
                              destination: `${env.pathes.logs}/${`log_${timestamp}.log`}`,
                          },
                      }
                    : null,
            ].filter((t) => !!t),
        });

        // Inject instance.
        container.registerInstance<Logger>(
            DependencyInjectionToken.Pino,
            pino(
                {
                    level: 'info',
                    timestamp: pino.stdTimeFunctions.isoTime,
                },
                transport,
            ),
        );
    },
);
