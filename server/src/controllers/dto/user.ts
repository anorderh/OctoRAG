import { ControllerRequest } from '../shared/interfaces/controller-request';
import { ControllerResponse } from '../shared/interfaces/controller-response';
import { UserReadModel } from '../shared/interfaces/user.models';

export type UserGetSelfRequest = ControllerRequest;
export type UserGetSelfResponse = ControllerResponse<{
    user: UserReadModel;
}>;
