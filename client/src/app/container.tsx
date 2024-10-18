import { useDatabase } from "@/hooks/useDatabase";
import { Outlet } from "react-router-dom";

export function Container() {
    let loading = useDatabase();

    return (
        <Outlet/>
    )
}