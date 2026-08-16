import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerConferenceHandlers } from "./modules/conference/socket/conference.socket";

export const initSocketServer = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });

        registerConferenceHandlers(io, socket);
    });

    return io;
};
