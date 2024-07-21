import { HttpVerb } from "../enums/http-verbs";

export interface RouteInput {
    httpType: HttpVerb;
    path: string;
}