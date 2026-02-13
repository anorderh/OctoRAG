import {
    ControllerBodyRequest,
    ControllerRequest,
} from '../shared/interfaces/controller-request';
import { ControllerResponse } from '../shared/interfaces/controller-response';

export type AuthRegisterRequest = ControllerBodyRequest<{
    username: string;
    email: string;
    password: string;
}>;
export type AuthRegisterResponse = ControllerResponse;

export type AuthLoginRequest = ControllerBodyRequest<{
    username: string;
    password: string;
}>;
export type AuthLoginResponse = ControllerResponse<{
    accessToken: string;
}>;

export type AuthRefreshRequest = ControllerRequest;
export type AuthRefreshResponse = AuthLoginResponse;

export type AuthLogoutRequest = ControllerRequest;
export type AuthLogoutResponse = ControllerResponse;
