import { Index, Pinecone } from "@pinecone-database/pinecone";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { container } from "tsyringe";

export class PineconeUtility {
    public static async namespaceExists(namespace: string) {
        let ragIndex: Index = container.resolve(DependencyInjectionToken.RagIndex);

        let indexStats = await ragIndex.describeIndexStats();
        let currNamespaces = new Set(
            Object.keys(indexStats.namespaces ?? [])
        )

        return currNamespaces.has(namespace)
    }
}