import type { RepoChat } from '../../../shared/interfaces/RepoChat';
import type { RepoMessage } from '../../../shared/interfaces/RepoMessage';
import type { ClientResponse } from './base';

export interface ChatCreateChatRequestDto {
    repoName: string;
    repoUrl: string;
}

export interface ChatSendMessageRequestDto {
    chatId: string;
    input: string;
}

export interface ChatDeleteChatRequestDto {
    chatId: string;
}

export interface ChatClearChatRequestDto {
    chatId: string;
}

export interface ChatRerunScrapeRequestDto {
    chatId: string;
}

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
export type ChatRerunScrapeResponse = ClientResponse;
