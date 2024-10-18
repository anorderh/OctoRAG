import { container } from 'tsyringe';
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import {CohereClient} from 'cohere-ai';
import { instantiate } from '../utils/extensions/instantiate';

export const SetupCohere = instantiate(
    DependencyInjectionToken.Cohere,
    async function() {
        container.registerInstance<CohereClient>(
            DependencyInjectionToken.Cohere,
            new CohereClient({
                token: env.cohere.apiKey
            })
        )
    }
)