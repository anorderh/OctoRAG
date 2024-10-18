import { container } from "tsyringe";
import OpenAI from 'openai';
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupOpenAI = instantiate(
    DependencyInjectionToken.OpenAI,
    async function() {
        container.registerInstance<OpenAI>(
            DependencyInjectionToken.OpenAI,
            new OpenAI({
                apiKey: env.openai.apiKey
            })
        )
    }
)