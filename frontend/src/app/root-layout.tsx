import { useEffect } from "react";
import { Outlet } from "react-router";
import api, {
    clearAccessToken,
    injectStoreCallbacks,
    setAccessToken
} from "@/lib/api";
import { fetchCurrentUser } from "@/api/user";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/store";

export default function RootLayout() {
    const { login: storeLogin, logout: storeLogout } = useStore(
        (state) => state.auth
    );

    useEffect(() => {
        const onRefresh = (data: { accessToken: string; user: any }) => {
            setAccessToken(data.accessToken);
            api.defaults.headers.common["Authorization"] =
                `Bearer ${data.accessToken}`;
            storeLogin(data.user, data.accessToken);
        };

        const onFailure = () => {
            clearAccessToken();
            storeLogout();
        };

        injectStoreCallbacks(onRefresh, onFailure);

        const checkAuthStatus = async () => {
            try {
                const user = await fetchCurrentUser();

                const authHeaders =
                    api.defaults.headers.common["Authorization"];
                if (!authHeaders) {
                    throw new Error("No Authorization header found");
                }

                if (
                    typeof authHeaders !== "string" ||
                    !authHeaders.startsWith("Bearer ")
                ) {
                    throw new Error("Invalid Authorization header format");
                }

                const accessToken = authHeaders.replace("Bearer ", "");

                storeLogin(user, accessToken);
            } catch (error) {
                console.error("Error fetching current user:", error);
                storeLogout();
            }
        };

        checkAuthStatus();
    }, [storeLogin, storeLogout]);

    return (
        <>
            <Outlet />
            <Toaster richColors position="bottom-right" />
        </>
    );
}
