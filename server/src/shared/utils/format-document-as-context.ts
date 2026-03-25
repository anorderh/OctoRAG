import { Document } from '@langchain/core/documents';

export function formatDocumentsAsContext(docs: Document[]) {
    return docs
        .map(
            (d) => `
<document id="${d.id}">

<source>
filename: ${d.metadata.filename}
fileUrl: ${d.metadata.fileUrl}
repo: ${d.metadata.repoName}
repoUrl: ${d.metadata.repoUrl}
</source>

<context>
summary: ${d.metadata.contextSummary ?? ''}

keywords: ${(d.metadata.contextKeywords ?? []).join(', ')}

intent: ${(d.metadata.intent ?? []).join(', ')}

risk: ${(d.metadata.risk ?? []).join(', ')}
</context>

<code>
${d.pageContent}
</code>

</document>
`,
        )
        .join('\n');
}
