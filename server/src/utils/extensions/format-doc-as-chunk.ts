import { Document } from "@langchain/core/documents";

export function formatDocumentsAsChunk(documents: Document[]) {
    return documents
        .map((doc, idx) => 
            `-----CHUNK #${idx+1}----- \n\n` +
            `METADATA:\n${JSON.stringify(doc.metadata, null, 2)}\n\n` +
            `CONTENT:\n${doc.pageContent}`
        )
        .join("\n\n")
}