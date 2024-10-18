import { useEffect, useState } from "react";
import { axiosInstance } from "@/services/axios";
import { AppActionTypes, useAppContext } from "./AppProvider";
import { Database } from "@/models/interfaces";
import { wait } from "@/utils/wait";

export function useDatabase() {
    let [loading, setLoading] = useState(true);
    let { dispatch } = useAppContext();

    useEffect(() => {
        const fetch = async () => {
            // await wait(5000);
            // Fetch and store all data.
            let databaseRes = await axiosInstance.get('/test/database');
            let database = databaseRes.data as Database;

            for (let l of database.libraries) {
                dispatch({
                    type: AppActionTypes.ADD_LIBRARY,
                    payload: l
                })
            }
            for (let r of database.resources) {
                dispatch({
                    type: AppActionTypes.ADD_RESOURCE,
                    payload: r
                })
            }
            for (let s of database.sessions) {
                dispatch({
                    type: AppActionTypes.ADD_SESSION,
                    payload: s
                });
            }
            for (let c of database.chats) {
                dispatch({
                    type: AppActionTypes.ADD_CHAT,
                    payload: c
                });
            }
            setLoading(false);
        }

        fetch().catch((err: any) => {
            setLoading(false)
            console.error(err)
        });
    }, [])

    return loading;
}