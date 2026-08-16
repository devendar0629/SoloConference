import type { RequestHandler } from "express";
import { db } from "../../db";
import { ConferenceTable } from "../../db/schema";
import type { CreateConferenceBody } from "./conference.schema";
import { eq } from "drizzle-orm";

export const createConference: RequestHandler<
    any,
    any,
    CreateConferenceBody,
    any
> = async (req, res) => {
    const { title } = req.body;

    try {
        const [newConference] = await db
            .insert(ConferenceTable)
            .values({
                owner: req.user?.id,
                title,
            })
            .returning({
                id: ConferenceTable.id,
                title: ConferenceTable.title,
            });

        if (!newConference) {
            return res.status(500).json({
                message: "Failed to create conference",
            });
        }

        res.status(201).json({
            meetingCode: newConference.id,
        });
    } catch (error) {
        console.log("Error creating conference:", error);

        res.status(500).json({
            message: "Failed to create conference",
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
            columns: {
                owner: false,
            },
        });

        res.json(conferences);
    } catch (error) {
        console.log("Error retrieving conferences:", error);

        res.status(500).json({ message: "Failed to retrieve conferences" });
    }
};

export const getConference: RequestHandler = async (req, res) => {
    const { conference_id: conferenceId } = req.params;

    try {
        if (typeof conferenceId !== "string" || conferenceId.trim() === "") {
            return res.status(400).json({ message: "Invalid conference ID" });
        }

        const conference = await db.query.ConferenceTable.findFirst({
            where: (fields, operators) => {
                return operators.eq(fields.id, conferenceId);
            },
            columns: {
                owner: false,
            },
        });

        return res.json({
            message: "Conference fetched successfully",
            data: conference,
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch conference" });
    }
};

export const deleteAllConferences: RequestHandler = async (req, res) => {
    const userId = req.user?.id;

    try {
        await db
            .delete(ConferenceTable)
            .where(eq(ConferenceTable.owner, userId));

        res.status(200).json({
            message: "All conferences deleted successfully",
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Failed to delete conferences" });
    }
};
