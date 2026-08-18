import type { RequestHandler } from "express";
import { db } from "../../db/index.js";

export const getCurrentUser: RequestHandler = async (req, res) => {
    try {
        const userid = req.user.id;

        const user = await db.query.UsersTable.findFirst({
            where: (fields, operators) => operators.eq(fields.id, userid),
            columns: {
                password: false,
            },
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.json({
            message: "User fetched successfully",
            data: user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);

        return res.status(500).json({
            message: "Error fetching user",
        });
    }
};
