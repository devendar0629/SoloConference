import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerConferenceHandlers } from "./modules/conference/socket/conference.socket.js";
import jsonwebtoken from "jsonwebtoken";

export const initSocketServer = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const authCredentials = socket.handshake.auth;
        const conferenceJoinToken = authCredentials?.join_token;

        console.log(
            "MIDDLEWARE :: Conference Join Token: ",
            conferenceJoinToken,
        );

        try {
            const tokenPayload = jsonwebtoken.verify(
                conferenceJoinToken,
                process.env.CONFERENCE_TOKEN_SECRET!,
            );

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
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });

        registerConferenceHandlers(io, socket);
    });

    io.use((socket, next) => {
        const auth = socket.handshake.auth;

        console.log("MIDDLEWARE :: Auth details: ", auth);

        next();
    });

    return io;
};
