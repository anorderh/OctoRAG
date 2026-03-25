export const ContextualizedChunkSchema = {
    name: 'contextualized_chunk',
    schema: {
        type: 'object',
        properties: {
            summary: {
                type: 'string',
                description:
                    'Dense technical description of the code chunk. Include purpose, behavior, inputs/outputs, side effects, and architectural role. Avoid syntax-level details. 5 sentences long.',
            },
            keywords: {
                type: 'array',
                items: { type: 'string' },
                description:
                    'Important technical terms for retrieval (libraries, patterns, concepts)',
            },
            intent: {
                type: 'array',
                items: { type: 'string' },
                description:
                    'What this code is doing at a higher level (e.g., state-management, api, parsing)',
            },
            risk: {
                type: 'array',
                items: { type: 'string' },
                description:
                    'Potential risk areas (e.g., mutation, user-input, async, side-effects)',
            },
        },
        required: ['summary', 'keywords', 'intent', 'risk'],
        additionalProperties: false,
    },
};

export interface ContextualizedChunkOutput {
    summary: string;
    keywords: string[];
    intent: string[];
    risk: string[];
}
