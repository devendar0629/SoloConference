import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";

export const ensureRefreshToken: RequestHandler = async (req, res, next) => {
    let refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedRefreshToken = jsonwebtoken.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
        );

        req.user = decodedRefreshToken;
    } catch (error) {
        console.error("Error verifying refresh token:", error);

        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
};
