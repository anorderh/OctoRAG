import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { RepoLog } from 'src/database/entities/repo-log/repo-log';
import { RepoMessage } from 'src/database/entities/repo-message/repo-message';
import {
    ControllerBodyRequest,
    ControllerParamsRequest,
    ControllerRequest,
} from '../shared/interfaces/controller-request';
import { ControllerResponse } from '../shared/interfaces/controller-response';

export type ChatCreateChatRequest = ControllerBodyRequest<{
    repoName: string;
    repoUrl: string;
}>;
export type ChatCreateChatResponse = ControllerResponse<{
    chat: RepoChat;
}>;

export type ChatGetChatsResponse = ControllerResponse<{
    chats: RepoChat[];
}>;

export type ChatGetDetailsRequest = ControllerParamsRequest<{
    chatId: string;
}>;
export type ChatGetDetailsResponse = ControllerResponse<{
    chat: RepoChat;
    messages: RepoMessage[];
    logs: RepoLog[];
}>;

export type ChatSendMessageRequest = ControllerRequest<
    {
        chatId: string;
    },
    {
        input: string;
    }
>;
export type ChatSendMessageResponse = ControllerResponse<{
    message: RepoMessage;
}>;

export type ChatDeleteChatRequest = ControllerParamsRequest<{
    chatId: string;
}>;
export type ChatDeleteChatResponse = ControllerResponse<{
    deletedCount: number;
}>;

export type ChatClearChatRequest = ControllerParamsRequest<{
    chatId: string;
}>;
export type ChatClearChatResponse = ControllerResponse<{
    deletedCount: number;
}>;

export type ChatRunScrapeRequest = ControllerParamsRequest<{
    chatId: string;
}>;
export type ChatRunScrapeResponse = ControllerResponse;
