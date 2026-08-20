import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";
import type { UserFromToken } from "../../types/express/index.js";

export const ensureRefreshToken: RequestHandler = async (req, res, next) => {
    let refreshToken = req.cookies.refresh_token;

    console.log("Headers:", req.headers);
    console.log("Cookies:", req.cookies);

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decodedRefreshToken = jsonwebtoken.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
        );

        req.user = decodedRefreshToken as UserFromToken;
    } catch (error) {
        console.error("Error verifying refresh token:", error);

        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
};
