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
            storeLogin(data.user);
        };

        const onFailure = () => {
            clearAccessToken();
            storeLogout();
        };

        injectStoreCallbacks(onRefresh, onFailure);

        const checkAuthStatus = async () => {
            console.log("Checking auth status ...");

            try {
                const user = await fetchCurrentUser();

                console.log("Fetched user: ", user);

                storeLogin(user);
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
