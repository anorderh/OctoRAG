import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { Pinecone } from "@pinecone-database/pinecone";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupPinecone = instantiate(
    DependencyInjectionToken.Pinecone,
    async function() {
        container.registerInstance<Pinecone>(
            DependencyInjectionToken.Pinecone,
            new Pinecone({
                apiKey: env.pinecone.apiKey
            })
        )
    }
)