export const ACCESS_TOKEN_EXPIRY_MS = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY_MS || "3600",
    10,
);

export const REFRESH_TOKEN_EXPIRY_MS =
    parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS || "86400", 10) * 1000;

export const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
