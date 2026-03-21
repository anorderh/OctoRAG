export const RefinedQuerySchema = {
    name: 'refined_query',
    schema: {
        type: 'object',
        properties: {
            query: { type: 'string' },
            intent: { type: 'string' },
            keywords: {
                type: 'array',
                items: { type: 'string' },
            },
            code_patterns: {
                type: 'array',
                items: { type: 'string' },
            },
            variants: {
                type: 'array',
                items: { type: 'string' },
            },
        },
        required: ['query', 'intent', 'keywords', 'code_patterns', 'variants'],
        additionalProperties: false,
    },
};
