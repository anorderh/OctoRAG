import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
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

export type ChatRerunScrapeRequest = ControllerParamsRequest<{
    chatId: string;
}>;
export type ChatRerunScrapeResponse = ControllerResponse;
