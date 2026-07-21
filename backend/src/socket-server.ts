import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

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
    });

    return io;
};
