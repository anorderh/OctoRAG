import OpenAI from 'openai';
import { env } from 'src/shared/constants/env';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupOpenAI = instantiate(
    DependencyInjectionToken.OpenAI,
    async function () {
        container.registerInstance<OpenAI>(
            DependencyInjectionToken.OpenAI,
            new OpenAI({
                apiKey: env.openai.apiKey,
            }),
        );
    },
);
