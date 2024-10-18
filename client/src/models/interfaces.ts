import { ChatType, ResourceType } from "./constants";

export interface Library {
    _id: string;
    name: string;
    pendingScrape: boolean;
}

export interface Resource {
    _id: string;
    _libraryId: string;
    path: string;
}

export interface OnlineResource {
    _id: string;
    type: string;
    _libraryId: string;
    url: string;
}

export interface Session {
    _id: string;
    _libraryId: string;
}

export interface Chat {
    _id: string;
    _sessionId: string;
    type: ChatType;
    content: string;
}

export interface Database {
    libraries: Library[],
    resources: Resource[],
    sessions: Session[],
    chats: Chat[]
}