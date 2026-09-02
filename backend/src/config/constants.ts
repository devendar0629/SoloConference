export const CONFERENCE_TOKEN_EXPIRY_MS = parseInt(
    process.env.CONFERENCE_TOKEN_EXPIRY_MS || "900",
    10,
);

export const ACCESS_TOKEN_EXPIRY_MS = parseInt(
    process.env.ACCESS_TOKEN_EXPIRY_MS || "3600",
    10,
);

export const REFRESH_TOKEN_EXPIRY_MS =
    parseInt(process.env.REFRESH_TOKEN_EXPIRY_MS || "86400", 10) * 1000;

export const IS_DEVELOPMENT = (process.env.IS_DEVELOPMENT || "0") === "1";
