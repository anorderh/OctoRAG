import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { Index, Pinecone } from "@pinecone-database/pinecone";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupRagIndex = instantiate<Index>(
    DependencyInjectionToken.RagIndex,
    async function(index: Index) {
        container.registerInstance<Index>(
            DependencyInjectionToken.RagIndex,
            index
        )
    }
)