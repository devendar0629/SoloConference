import type { RequestHandler } from "express";
import { db } from "../../db";
import { ConferenceTable } from "../../db/schema";
import type { CreateConferenceBody } from "./conference.schema";

export const createConference: RequestHandler<
    any,
    any,
    CreateConferenceBody,
    any
> = async (req, res) => {
    const { title } = req.body;

    try {
        const newConference = await db
            .insert(ConferenceTable)
            .values({
                owner: req.user?.id,
                title,
            })
            .returning({
                id: ConferenceTable.id,
                title: ConferenceTable.title,
            });

        res.status(201).json(newConference);
    } catch (error) {
        console.log("Error creating conference:", error);

        res.status(500).json({
            message: "Failed to create conference",
            error,
        });
    }
};

export const getAllConferences: RequestHandler = async (req, res) => {
    const userId = req.user?.id;

    try {
        const conferences = await db.query.ConferenceTable.findMany({
            where: (fields, operators) => {
                return operators.eq(fields.owner, userId);
            },
            with: {
                owner: {
                    columns: {
                        password: false,
                    },
                },
            },
        });

        res.json(conferences);
    } catch (error) {
        console.log("Error retrieving conferences:", error);

        res.status(500).json({ message: "Failed to retrieve conferences" });
    }
};
