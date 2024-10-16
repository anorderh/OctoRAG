import { Document } from "@langchain/core/documents";

export function formatDocumentsAsContext(documents: Document[]) {
    return documents
        .map((doc, idx) => 
            `-----CHUNK #${idx+1}----- \n\n` +
            `${doc.pageContent}`
        )
        .join("\n\n")
}