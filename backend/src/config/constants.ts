export const ACCESS_TOKEN_EXPIRY_SECONDS = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY_SECONDS || "3600",
    10,
);

export const REFRESH_TOKEN_EXPIRY_SECONDS = parseInt(
    process.env.REFRESH_TOKEN_EXPIRY_SECONDS || "86400",
    10,
);
