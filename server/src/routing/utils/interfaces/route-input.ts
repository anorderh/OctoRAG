import { HttpVerb } from "src/shared/utils/constants/http-verbs";

export interface RouteInput {
    httpType: HttpVerb;
    path: string;
}