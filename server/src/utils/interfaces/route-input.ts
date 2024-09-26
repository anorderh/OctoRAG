import { HttpVerb } from '../enums/http-verbs.js';

export interface RouteInput {
    httpType: HttpVerb;
    path: string;
}