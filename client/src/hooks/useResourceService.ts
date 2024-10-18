import { AppActionTypes, AppContext, AppContextType, useAppContext } from "@/hooks/AppProvider"
import { Library, OnlineResource } from "@/models/interfaces";
import { axiosInstance } from "../services/axios";
import { useState } from "react";

export function useResourceService() {
    let [loading, setLoading] = useState(false);
    let {state, dispatch} = useAppContext();

    async function addOnlineResource(libraryId: string, url: string, type: string) {
        setLoading(true);
        let res = await axiosInstance.post('/library/add/resource/online', {
            _libraryId: libraryId,
            type,
            url
        });
        let onlineResource = {
            _id: res.data.onlineResourceId,
            _libraryId: libraryId,
            type,
            url
        } as OnlineResource
        dispatch({
            type: AppActionTypes.ADD_RESOURCE,
            payload: onlineResource
        })
        setLoading(false);
    }

    return {
        loading,
        addOnlineResource
    }
}