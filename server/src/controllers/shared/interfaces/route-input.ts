import { HttpVerb } from 'src/shared/constants/http-verbs';

export interface RouteInput {
    httpType: HttpVerb;
    path: string;
}
