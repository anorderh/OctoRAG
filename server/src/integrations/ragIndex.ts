import { Index } from '@pinecone-database/pinecone';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupRagIndex = instantiate<Index>(
    DependencyInjectionToken.RagIndex,
    async function (index: Index) {
        container.registerInstance<Index>(
            DependencyInjectionToken.RagIndex,
            index,
        );
    },
);
