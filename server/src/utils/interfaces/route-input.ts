import { HttpVerb } from "../enums/http-verbs";

export interface RouteInput {
    method: HttpVerb;
    path: string;
}