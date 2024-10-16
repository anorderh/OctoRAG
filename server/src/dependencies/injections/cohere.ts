import { container } from 'tsyringe';
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import {CohereClient} from 'cohere-ai';

export async function SetupCohere() {
    container.registerInstance<CohereClient>(
        DependencyInjectionToken.Cohere,
        new CohereClient({
            token: env.cohere.apiKey
        })
    )
}