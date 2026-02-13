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
    type AuthLogoutResponse,
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
        withCredentials: true,
    });

    constructor() {
        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Ensure all requests have access token, if available.
        this.axiosClient.interceptors.request.use(function (config) {
            const authState = useAuthStore.getState();
            if (authState.accessToken != null) {
                config.headers.Authorization = `${authState.accessToken}`;
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
                //  3. The retried request was a refresh endpoint.
                if (
                    error.response?.status !== 401 ||
                    failedRequest.retried ||
                    failedRequest.url?.includes('/auth/refresh')
                ) {
                    return Promise.reject(error);
                }

                try {
                    // Use refresh http cookie to get new access token, and attempt retry.
                    const newAccessToken = await this.refresh();
                    authStore.setAccessToken(newAccessToken); // Put into store.
                    failedRequest.headers.Authorization = `${newAccessToken}`;
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
        await this.axiosClient.post<AuthRegisterResponse>(
            '/auth/register',
            request,
        );
    }

    public async login(request: AuthLoginRequestDto): Promise<string> {
        const res = await this.axiosClient.post<AuthLoginResponse>(
            '/auth/login',
            request,
        );

        return res.data.data!.accessToken;
    }

    public async refresh(): Promise<string> {
        const res =
            await this.axiosClient.get<AuthRefreshResponse>('/auth/refresh');

        return res.data.data!.accessToken;
    }

    public async logout(): Promise<void> {
        await this.axiosClient.get<AuthLogoutResponse>('/auth/logout');
    }

    // Chat Controller methods.
    public async createChat(
        request: ChatCreateChatRequestDto,
    ): Promise<RepoChat> {
        const res = await this.axiosClient.post<ChatCreateChatResponse>(
            '/chat/new',
            request,
        );

        return res.data.data!.chat;
    }

    public async messageChat(
        request: ChatSendMessageRequestDto,
    ): Promise<void> {
        await this.axiosClient.post<ChatSendMessageResponse>(
            `/chat/${request.chatId}`,
            request,
        );
    }

    public async deleteChat(request: ChatDeleteChatRequestDto): Promise<void> {
        await this.axiosClient.delete<ChatDeleteChatResponse>(
            `/chat/${request.chatId}`,
        );
    }

    public async clearChat(request: ChatClearChatRequestDto): Promise<void> {
        await this.axiosClient.delete<ChatClearChatResponse>(
            `/chat/${request.chatId}/clear`,
        );
    }

    public async rerunChatScrape(
        request: ChatRunScrapeRequestDto,
    ): Promise<void> {
        await this.axiosClient.delete<ChatRunScrapeResponse>(
            `/chat/${request.chatId}/run`,
        );
    }

    // User Controller methods.
    public async getSelf(request: UserGetSelfRequestDto) {
        const res = await this.axiosClient.get<UserGetSelfResponse>(`/user`);

        return res.data.data!.user;
    }
}

export const api = new Api();
