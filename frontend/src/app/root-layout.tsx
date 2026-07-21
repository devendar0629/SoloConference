import { useEffect } from "react";
import { Outlet } from "react-router";
import api, { injectStoreCallbacks } from "@/lib/api";
import { fetchCurrentUser } from "@/api/user";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/store";

export default function RootLayout() {
    const { login, logout } = useStore((state) => state.auth);

    useEffect(() => {
        const onRefresh = (token: string) => {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        };

        const onFailure = () => {
            logout();
        };

        injectStoreCallbacks(onRefresh, onFailure);

        const checkAuthStatus = async () => {
            try {
                const user = await fetchCurrentUser();

                login(user);
            } catch (error) {
                console.error("Error fetching current user:", error);
                logout();
            }
        };

        checkAuthStatus();
    }, [login, logout]);

    return (
        <>
            <Outlet />
            <Toaster richColors position="bottom-right" />
        </>
    );
}
