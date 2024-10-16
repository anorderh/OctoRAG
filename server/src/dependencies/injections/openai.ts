import { container } from "tsyringe";
import OpenAI from 'openai';
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";

export function SetupOpenAI() {
    container.registerInstance<OpenAI>(
        DependencyInjectionToken.OpenAI,
        new OpenAI({
            apiKey: env.openai.apiKey
        })
    )
}