import { AppActionTypes, AppContext, AppContextType, useAppContext } from "@/hooks/AppProvider"
import { Chat, Library, OnlineResource, Session } from "@/models/interfaces";
import { axiosInstance } from "../services/axios";
import { useState } from "react";
import { ChatType } from "@/models/constants";
import { v4 as uuidv4 } from 'uuid';

export function useSessionService() {
    let [loading, setLoading] = useState(false);
    let {state, dispatch} = useAppContext();

    async function createSession(libraryId: string) : Promise<string> {
        setLoading(true);
        let res = await axiosInstance.post('/chat/session', {
            _libraryId: libraryId,
            llmModel: "gpt-3.5-turbo-0125",
            forceNewScrape: false,
            embeddingModel: "text-embedding-ada-002"
        });
        let session = {
            _id: res.data._sessionId,
            _libraryId: libraryId
        } as Session;
        dispatch({
            type: AppActionTypes.ADD_SESSION,
            payload: session
        })
        setLoading(false);
        return session._id;
    }

    async function chat(sessionId: string, input: string) {
        setLoading(true);
        let humanChat = {
            _id: uuidv4(),
            _sessionId: sessionId,
            content: input,
            type: ChatType.Human
        } as Chat;
        dispatch({
            type: AppActionTypes.ADD_CHAT,
            payload: humanChat
        })

        let res = await axiosInstance.post('/chat/session/input', {
            _sessionId: sessionId,
            input: input
        });
        let debug = res.data.debug;

        let aiChat = {
            _id: uuidv4(),
            _sessionId: sessionId,
            content: debug.output,
            type: ChatType.AI
        } as Chat;
        dispatch({
            type: AppActionTypes.ADD_CHAT,
            payload: aiChat
        })
        setLoading(false);
    }

    return {
        loading,
        createSession,
        chat
    }
}