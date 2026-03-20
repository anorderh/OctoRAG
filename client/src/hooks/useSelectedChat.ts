import type { RepoChat } from '../shared/interfaces/RepoChat';
import { useChatStore } from '../store/chat';

// Hook responsible for fetching the selected chat.
export function useSelectedChat(): RepoChat | null {
    return (
        useChatStore((state) => {
            return state.selectedId == null
                ? null
                : state.entities[state.selectedId];
        }) ?? null
    );
}
