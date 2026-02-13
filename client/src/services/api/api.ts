import axios, {
    AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios';
import { appConfig } from '../../config';
import type { RepoChat } from '../../shared/interfaces/RepoChat';
import { useAuthStore } from '../../store/auth';
import {
    type AuthLoginRequestDto,
    type AuthLoginResponse,
    type AuthRefreshResponse,
    type AuthRegisterRequestDto,
    type AuthRegisterResponse,
} from './dto/auth';
import type {
    ChatClearChatRequestDto,
    ChatClearChatResponse,
    ChatCreateChatRequestDto,
    ChatCreateChatResponse,
    ChatDeleteChatRequestDto,
    ChatDeleteChatResponse,
    ChatRunScrapeRequestDto,
    ChatRunScrapeResponse,
    ChatSendMessageRequestDto,
    ChatSendMessageResponse,
} from './dto/chat';
import type { UserGetSelfRequestDto, UserGetSelfResponse } from './dto/user';

export class Api {
    public axiosClient = axios.create({
        baseURL: appConfig.apiUrl,
    });

    constructor() {
        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Ensure all requests have access token, if available.
        this.axiosClient.interceptors.request.use(function (config) {
            const authState = useAuthStore.getState();
            if (authState.accessToken != null) {
                config.headers.Authorization = `Bearer ${authState.accessToken}`;
            }
            return config;
        });

        // Add a response interceptor to retry unauthenticated requests.
        this.axiosClient.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError) => {
                const failedRequest =
                    error.config as InternalAxiosRequestConfig & {
                        retried?: boolean;
                    };
                const authStore = useAuthStore.getState();

                // Don't attempt retry for requests that were:
                //  1. Properly authenticated
                //  2. Already retried.
                if (error.response?.status !== 401 || failedRequest.retried) {
                    return Promise.reject(error);
                }

                try {
                    // Use refresh http cookie to get new access token, and attempt retry.
                    const newAccessToken = await this.refresh();
                    authStore.setAccessToken(newAccessToken); // Put into store.
                    failedRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    failedRequest.retried = true;
                    return this.axiosClient.request(failedRequest);
                } catch (error) {
                    authStore.logout();
                    return Promise.reject(error);
                }
            },
        );
    }

    // Auth Controller methods.
    public async register(request: AuthRegisterRequestDto): Promise<void> {
        let res = await this.axiosClient.post<AuthRegisterResponse>(
            '/auth/register',
            request,
        );
        if (res.data.success) {
            return;
        }
        throw new Error('Register action failed.');
    }
    public async login(request: AuthLoginRequestDto): Promise<string> {
        let res = await this.axiosClient.post<AuthLoginResponse>(
            '/auth/login',
            request,
        );
        if (res.data.success) {
            return res.data.data!.accessToken;
        }
        throw new Error('Login action failed.');
    }
    public async refresh(): Promise<string> {
        let res =
            await this.axiosClient.get<AuthRefreshResponse>('/auth/refresh');
        if (res.data.success) {
            return res.data.data!.accessToken;
        }
        throw new Error('Refresh action failed.');
    }

    // Chat Controller methods.
    public async createChat(
        request: ChatCreateChatRequestDto,
    ): Promise<RepoChat> {
        let res = await this.axiosClient.post<ChatCreateChatResponse>(
            '/chat/new',
            request,
        );
        if (res.data.success) {
            return res.data.data!.chat;
        }
        throw new Error('Create Chat action failed.');
    }
    public async messageChat(
        request: ChatSendMessageRequestDto,
    ): Promise<void> {
        let res = await this.axiosClient.post<ChatSendMessageResponse>(
            `/chat/${request.chatId}`,
            request,
        );
        if (res.data.success) {
            return;
        }
        throw new Error('Message Chat action failed.');
    }
    public async deleteChat(request: ChatDeleteChatRequestDto) {
        let res = await this.axiosClient.delete<ChatDeleteChatResponse>(
            `/chat/${request.chatId}`,
        );
        if (res.data.success) {
            return;
        }
        throw new Error('Delete Chat action failed.');
    }
    public async clearChat(request: ChatClearChatRequestDto) {
        let res = await this.axiosClient.delete<ChatClearChatResponse>(
            `/chat/${request.chatId}/clear`,
        );
        if (res.data.success) {
            return;
        }
        throw new Error('Clear Chat action failed.');
    }
    public async rerunChatScrape(request: ChatRunScrapeRequestDto) {
        let res = await this.axiosClient.delete<ChatRunScrapeResponse>(
            `/chat/${request.chatId}/run`,
        );
        if (res.data.success) {
            return;
        }
        throw new Error('Rerun Chat Scrape action failed.');
    }

    // User Controller methods.
    public async getSelf(request: UserGetSelfRequestDto) {
        let res = await this.axiosClient.get<UserGetSelfResponse>(`/user`);
        if (res.data.success) {
            return res.data.data!.user;
        }
        throw new Error('Get User Self action failed.');
    }
}

export const api = new Api();
