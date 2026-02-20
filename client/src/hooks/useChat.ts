import { useChatStore } from '../store/chat';

export function useChat(chatId: string) {
    return useChatStore.getState().chats.find((c) => c._id == chatId);
}
