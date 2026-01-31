import { CohereClient } from 'cohere-ai';
import { env } from 'src/shared/constants/env';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupCohere = instantiate(
    DependencyInjectionToken.Cohere,
    async function () {
        container.registerInstance<CohereClient>(
            DependencyInjectionToken.Cohere,
            new CohereClient({
                token: env.cohere.apiKey,
            }),
        );
    },
);
