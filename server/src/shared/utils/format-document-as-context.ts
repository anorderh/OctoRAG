import { Document } from '@langchain/core/documents';

export function formatDocumentsAsContext(docs: Document[]) {
    return docs
        .map(
            (d) => `
<document id="${d.id}">
<source>
filename: ${d.metadata.filename}
repo: ${d.metadata.repoName}
</source>

<summary>
${d.metadata.contextSummary ?? ''}
</summary>

<content>
${d.pageContent}
</content>
</document>
`,
        )
        .join('\n');
}
