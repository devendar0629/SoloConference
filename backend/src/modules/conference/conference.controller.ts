import type { RequestHandler } from "express";
import { db } from "../../db/index.js";
import { ConferenceTable } from "../../db/schema/index.js";
import type { CreateConferenceBody } from "./conference.schema.js";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import { CONFERENCE_TOKEN_EXPIRY_MS } from "../../config/constants.js";
import { UUIDSchema } from "../../utils/validation-schema.js";
import { sql } from "drizzle-orm";

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
            where: (fields, { eq }) => eq(fields.id, conferenceId),
            columns: {
                owner: false,
                passcode: false,
            },
            extras: {
                isPasscodeRequired:
                    sql<boolean>`CASE WHEN ${ConferenceTable.passcode} IS NOT NULL AND NOT ${ConferenceTable.owner} = ${req.user.id} THEN TRUE ELSE FALSE END`
                        .mapWith(Boolean)
                        .as("is_passcode_required"),
            },
        });

        if (!conference) {
            return res.status(404).json({ message: "Conference not found" });
        }

        return res.json({
            message: "Conference fetched successfully",
            data: {
                id: conference.id,
                title: conference.title,
                createdAt: conference.createdAt,
                updatedAt: conference.updatedAt,
                isPasscodeRequired: conference.isPasscodeRequired,
            },
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
    const passcode = req.body.passcode;

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

        const isOwner = req.user.id === conference.owner;
        const isPasscodeProtected = !!conference.passcode;

        const isPasscodeRequired = isPasscodeProtected && !isOwner;
        if (isPasscodeRequired) {
            if (!passcode) {
                return res
                    .status(400)
                    .json({ message: "Passcode is required" });
            }

            const isPasscodeValid = await argon2.verify(
                conference.passcode!,
                passcode,
            );

            if (!isPasscodeValid) {
                return res.status(400).json({
                    code: "INVALID_PASSCODE",
                    message: "Invalid passcode",
                });
            }
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
        res.status(500).json({
            message: "Failed to generate conference join token",
        });
    }
};
