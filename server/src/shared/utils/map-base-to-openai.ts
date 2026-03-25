import { BaseMessage } from '@langchain/core/messages';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export function mapHistoryToOpenAI(
    history: BaseMessage[],
    limit = 6,
): ChatCompletionMessageParam[] {
    return history.slice(-limit).map((msg) => {
        const content = msg.content.toString();

        switch (msg._getType()) {
            case 'human':
                return {
                    role: 'user' as const,
                    content,
                };

            case 'ai':
                return {
                    role: 'assistant' as const,
                    content,
                };

            case 'system':
                return {
                    role: 'system' as const,
                    content,
                };

            default:
                return {
                    role: 'assistant' as const,
                    content,
                };
        }
    });
}
