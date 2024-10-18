import { AppActionTypes, AppContext, AppContextType, useAppContext } from "@/hooks/AppProvider"
import { Library } from "@/models/interfaces";
import { axiosInstance } from "../services/axios";
import { useState } from "react";

export function useLibraryService() {
    let [loading, setLoading] = useState(false);
    let {state, dispatch} = useAppContext();

    async function addLibrary(name: string) {
        try {
            setLoading(true);
            let res = await axiosInstance.post('/library', {
                name
            });
            let library = {
                _id: res.data._libraryId,
                name: name
            } as Library
            dispatch({
                type: AppActionTypes.ADD_LIBRARY,
                payload: library
            })
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    async function scrapeLibrary(libraryId: string) {
        try {
            setLoading(true);
            await axiosInstance.post('/library/scrape', {
                _libraryId: libraryId,
                embeddingModel: "text-embedding-3-small"
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    return {
        loading,
        addLibrary,
        scrapeLibrary
    }
}