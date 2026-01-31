import { Document } from "@langchain/core/documents";

export function formatDocumentsAsContext(documents: Document[]) {
    let metadataPropLimit = 500;
    const reducePropLengths = (metadata: any) => {
        return Object.entries(metadata).reduce((acc: any, [key, val]: [string, any]) => {
            acc[key] = (val as string).slice(0, metadataPropLimit)
            return acc;
        }, {})
    }
    return documents
        .map((doc, idx) => 
            `-----CHUNK #${idx+1}----- \n\n` +
            `${reducePropLengths(doc.metadata)}\n\n` +
            `${doc.pageContent}`
        )
        .join("\n\n")
}