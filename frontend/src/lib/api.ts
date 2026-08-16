import { serverHost, serverPort } from "@/config/constants";
import axios from "axios";
import {} from "@/store/slices/useAuthSlice";

const api = axios.create({
    baseURL: `http://${serverHost}:${serverPort}/api/v1`,
    withCredentials: true
});

let onTokenRefreshed: (data: {
    accessToken: string;
    user: any;
}) => void = () => {};
let onAuthFailure: () => void = () => {};

export const injectStoreCallbacks = (
    onRefresh: (data: { accessToken: string; user: any }) => void,
    onFailure: () => void
) => {
    onTokenRefreshed = onRefresh;
    onAuthFailure = onFailure;
};

// Global memory tracking
let cachedToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setAccessToken = (token: string | null) => {
    cachedToken = token;
};

export const clearAccessToken = () => {
    setAccessToken(null);
};

// 1. Request Interceptor: Apply token to outgoing fresh requests
api.interceptors.request.use((config) => {
    const token = cachedToken;

    if (token && config.headers) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.url?.includes("/auth/refresh-token")) {
            onAuthFailure();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, everyone awaits the SAME promise
                if (!refreshPromise) {
                    refreshPromise = api
                        .post(
                            "/auth/refresh-token",
                            {},
                            { withCredentials: true }
                        )
                        .then((res) => {
                            const responseData = res.data.data;

                            setAccessToken(responseData.accessToken);
                            onTokenRefreshed(responseData);

                            return responseData.accessToken;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                }

                // Await the active token refresh
                const token = await refreshPromise;

                // Re-attach token and fire the retry directly via base axios instance
                originalRequest.headers.set("Authorization", `Bearer ${token}`);

                return api(originalRequest);
            } catch (refreshError) {
                onAuthFailure();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
