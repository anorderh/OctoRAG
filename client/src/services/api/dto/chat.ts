import type { RepoChat } from '../../../shared/interfaces/RepoChat';
import type { RepoLog } from '../../../shared/interfaces/RepoLog';
import type { RepoMessage } from '../../../shared/interfaces/RepoMessage';
import type { ClientResponse } from './base';

export interface ChatCreateChatRequestDto {
    repoUrl: string;
}

export interface ChatSendMessageRequestDto {
    chatId: string;
    input: string;
}

export interface ChatGetChatRequestDto {
    chatId: string;
}

export interface ChatDeleteChatRequestDto {
    chatId: string;
}

export interface ChatClearChatRequestDto {
    chatId: string;
}

export interface ChatRunScrapeRequestDto {
    chatId: string;
}

export type ChatGetChatResponse = ClientResponse<{
    chat: RepoChat;
    messages: RepoMessage[];
    logs: RepoLog[];
}>;

export type ChatCreateChatResponse = ClientResponse<{
    chat: RepoChat;
}>;

export type ChatSendMessageResponse = ClientResponse<{
    message: RepoMessage;
}>;

export type ChatClearChatResponse = ClientResponse<{
    deletedCount: number;
}>;

export type ChatDeleteChatResponse = ClientResponse<{
    deletedCount: number;
}>;
export type ChatRunScrapeResponse = ClientResponse;
