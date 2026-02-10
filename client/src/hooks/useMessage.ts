import type { RepoMessage } from '../shared/interfaces/RepoMessage';
import { useMessageStore } from '../store/messages';

export function useMessage(messageId: string): RepoMessage | null {
    return useMessageStore((state) => state.messages[messageId]);
}
