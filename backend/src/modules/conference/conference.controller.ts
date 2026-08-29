import type { RequestHandler } from "express";
import { db } from "../../db/index.js";
import { ConferenceTable } from "../../db/schema/index.js";
import type { CreateConferenceBody } from "./conference.schema.js";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import { CONFERENCE_TOKEN_EXPIRY_MS } from "../../config/constants.js";
import { UUIDSchema } from "../../utils/validation-schema.js";

export const createConference: RequestHandler<
    any,
    any,
    CreateConferenceBody,
    any
> = async (req, res) => {
    const { title, passcode } = req.body;
    let hashedPasscode = undefined;

    try {
        if (passcode !== undefined) {
            hashedPasscode = await argon2.hash(passcode);
        }

        const [newConference] = await db
            .insert(ConferenceTable)
            .values({
                owner: req.user.id,
                title,
                passcode: hashedPasscode,
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
    const userId = req.user.id;

    try {
        const conferences = await db.query.ConferenceTable.findMany({
            where: (fields, operators) => {
                return operators.eq(fields.owner, userId);
            },
            columns: {
                owner: false,
                passcode: false,
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
                passcode: false,
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
    const userId = req.user.id;

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

export const generateConferenceJoinToken: RequestHandler = async (req, res) => {
    const { conference_id: conferenceId } = req.params;

    try {
        if (typeof conferenceId !== "string" || conferenceId.trim() === "") {
            return res.status(400).json({ message: "Invalid conference ID" });
        }

        if (UUIDSchema.safeParse(conferenceId).success === false) {
            return res
                .status(400)
                .json({ message: "Invalid conference ID format" });
        }

        const conference = await db.query.ConferenceTable.findFirst({
            where: (fields, operators) => {
                return operators.eq(fields.id, conferenceId);
            },
        });

        if (!conference) {
            return res.status(404).json({ message: "Conference not found" });
        }

        const tokenPayload = {
            conference_id: conference.id,
            user_id: req.user.id,
        };

        const joinToken = jsonwebtoken.sign(
            tokenPayload,
            process.env.CONFERENCE_TOKEN_SECRET!,
            {
                expiresIn: CONFERENCE_TOKEN_EXPIRY_MS,
            },
        );

        return res.json({ token: joinToken });
    } catch (error) {
        console.log("Error generating conference join token:", error);

        res.status(500).json({
            message: "Failed to generate conference join token",
        });
    }
};
