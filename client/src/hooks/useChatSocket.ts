import { useEffect } from 'react';
import { WebSocketEvents } from '../shared/constants/web-socket-events-enums';
import type { RepoChat } from '../shared/interfaces/RepoChat';
import type { RepoLog } from '../shared/interfaces/RepoLog';
import type { RepoMessage } from '../shared/interfaces/RepoMessage';
import { socket } from '../websocket';

interface UseChatSocketProps {
    chatId?: string;
    onStatus?: (chat: RepoChat) => void;
    onMessage?: (message: RepoMessage) => void;
    onLog?: (log: RepoLog) => void;
}

export const useChatSocket = ({
    chatId,
    onStatus,
    onMessage,
    onLog,
}: UseChatSocketProps) => {
    useEffect(() => {
        if (!chatId) return;

        socket.emit(WebSocketEvents.ChatJoin, chatId);

        const handleStatus = (chat: RepoChat) => {
            onStatus?.(chat);
        };

        const handleMessage = (message: RepoMessage) => {
            onMessage?.(message);
        };

        const handleLog = (log: RepoLog) => {
            onLog?.(log);
        };

        socket.on(WebSocketEvents.ChatStatus, handleStatus);
        socket.on(WebSocketEvents.ChatMessage, handleMessage);
        socket.on(WebSocketEvents.ChatLog, handleLog);

        return () => {
            socket.emit(WebSocketEvents.ChatLeave, chatId);

            socket.off(WebSocketEvents.ChatStatus, handleStatus);
            socket.off(WebSocketEvents.ChatMessage, handleMessage);
            socket.off(WebSocketEvents.ChatLog, handleLog);
        };
    }, [chatId]);
};
