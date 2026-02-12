import type { ClientResponse } from './base';

export interface AuthLoginRequestDto {
    username: string;
    password: string;
}

export interface AuthRegisterRequestDto {
    username: string;
    email: string;
    password: string;
}

export type AuthRefreshRequestDto = void;

export type AuthLoginResponse = ClientResponse<{
    accessToken: string;
}>;

export type AuthRegisterResponse = ClientResponse<null>;

export type AuthRefreshResponse = ClientResponse<{
    accessToken: string;
}>;
