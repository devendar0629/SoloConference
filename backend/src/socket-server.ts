import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerConferenceHandlers } from "./modules/conference/socket/conference.socket.js";
import jsonwebtoken from "jsonwebtoken";

type JoinTokenPayload = {
    conference_id: string;
    user_id: string;
};

export const initSocketServer = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const conferenceJoinToken = socket.handshake.auth.join_token;
        const conferenceId = socket.handshake.auth.conference_id;

        if (!conferenceJoinToken || !conferenceId) {
            const errorObj = new Error(
                "Missing conference join token or conference ID",
            );

            (errorObj as any).data = {
                code: "INVALID_PAYLOAD",
            };

            next(errorObj);
        }

        try {
            const tokenPayload = jsonwebtoken.verify(
                conferenceJoinToken,
                process.env.CONFERENCE_TOKEN_SECRET!,
            ) as JoinTokenPayload;

            if (tokenPayload.conference_id !== conferenceId) {
                const errorObj = new Error(
                    "Conference ID does not match the token payload",
                );

                (errorObj as any).data = {
                    code: "INVALID_CONFERENCE_JOIN_TOKEN",
                };

                next(errorObj);
            }

            socket.data.conferenceJoinTokenPayload = tokenPayload;

            next();
        } catch (error) {
            if (error instanceof jsonwebtoken.JsonWebTokenError) {
                const errorObj = new Error("Invalid conference join token");

                (errorObj as any).data = {
                    code: "INVALID_CONFERENCE_JOIN_TOKEN",
                };

                next(errorObj);
            }
        }
    });

    io.on("connection", (socket) => {
        registerConferenceHandlers(io, socket);
    });

    return io;
};
