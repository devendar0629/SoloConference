import type { RequestHandler } from "express";
import z from "zod";

// Tell TypeScript: "This function only accepts schemas that parse into an object with a 'body' property"
export const validateBody = (
    schema: z.ZodSchema<{ body: any }>,
): RequestHandler => {
    return (req, res, next) => {
        try {
            // TypeScript now guarantees parsedBody has a .body property
            const parsedBody = schema.parse({ body: req.body });

            req.body = parsedBody.body;
            next();
        } catch (error) {
            console.log("validateBody ::", error);

            if (error instanceof z.ZodError) {
                // (Using your Zod version's treeifyError)
                return res.status(400).json({ errors: z.treeifyError(error) });
            }

            return res.status(400).json({
                error: "INVALID_REQUEST_PAYLOAD",
                message: "Invalid request payload",
            });
        }
    };
};
