import type { RequestHandler } from "express";
import z from "zod";

export const validateBody = (
    schema: z.ZodSchema<{ body: any }>,
): RequestHandler => {
    return (req, res, next) => {
        try {
            const parsedBody = schema.parse({ body: req.body });

            req.body = parsedBody.body;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: z.treeifyError(error) });
            }

            return res.status(400).json({
                error: "INVALID_REQUEST_PAYLOAD",
                message: "Invalid request payload",
            });
        }
    };
};
