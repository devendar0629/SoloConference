import type { RequestHandler } from "express";
import jsonwebtoken from "jsonwebtoken";

export const jwtMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const sessionToken = authHeader.substring(authHeader.indexOf(" ") + 1);

    try {
        const decodedTokenPaylod = jsonwebtoken.verify(
            sessionToken,
            process.env.ACCESS_TOKEN_SECRET as string,
        );

        (req as any).user = decodedTokenPaylod;
    } catch (error) {
        console.error("JWT verification error:", error);

        return res.status(401).json({
            code: "UNAUTHORIZED",
            message: "Unauthorized request",
        });
    }

    return next();
};
