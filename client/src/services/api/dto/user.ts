import type { User } from '../../../shared/interfaces/User';
import type { ClientResponse } from './base';

export type UserGetSelfRequestDto = void;

export type UserGetSelfResponse = ClientResponse<{
    user: User;
}>;
