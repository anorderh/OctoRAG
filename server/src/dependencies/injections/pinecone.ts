import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { Pinecone } from "@pinecone-database/pinecone";

export function SetupPinecone() {
    container.registerInstance<Pinecone>(
        DependencyInjectionToken.Pinecone,
        new Pinecone({
            apiKey: env.pinecone.apiKey
        })
    )
}