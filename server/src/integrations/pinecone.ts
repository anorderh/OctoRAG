import { Pinecone } from '@pinecone-database/pinecone';
import { env } from 'src/shared/constants/env';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupPinecone = instantiate(
    DependencyInjectionToken.Pinecone,
    async function () {
        container.registerInstance<Pinecone>(
            DependencyInjectionToken.Pinecone,
            new Pinecone({
                apiKey: env.pinecone.apiKey,
            }),
        );
    },
);
