export const serverHost = import.meta.env.VITE_SERVER_HOST || "localhost";
export const serverPort = import.meta.env.VITE_SERVER_PORT || "8000";

export const isDevelopment = import.meta.env.NODE_ENV !== "production";

export const AUTH_NOT_REQUIRED_ROUTES = ["/auth/login", "/auth/signup"];
