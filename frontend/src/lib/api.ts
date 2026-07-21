import { serverHost, serverPort } from "@/config/constants";
import axios from "axios";

const api = axios.create({
    baseURL: `http://${serverHost}:${serverPort}/api/v1`,
    withCredentials: true
});

let onTokenRefreshed: (token: string) => void = () => {};
let onAuthFailure: () => void = () => {};

export const injectStoreCallbacks = (
    onRefresh: (token: string) => void,
    onFailure: () => void
) => {
    onTokenRefreshed = onRefresh;
    onAuthFailure = onFailure;
};

// Global memory tracking
let cachedToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

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
                            const newAccessToken = res.data.data;
                            onTokenRefreshed(newAccessToken);
                            cachedToken = newAccessToken;
                            return newAccessToken;
                        })
                        .finally(() => {
                            refreshPromise = null; // Reset when done
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
