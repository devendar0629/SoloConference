import type { RequestHandler } from "express";

export const ensureUserIsAuthenticated: RequestHandler = (req, res, next) => {
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    return next();
};
