import type { Server, Socket } from "socket.io";
import conferenceHandlers from "./handlers/index.js";

export const leaveConferenceRoom = (socket: Socket, conferenceId: string) => {
    if (!conferenceId || !socket.rooms.has(conferenceId)) {
        return false;
    }

    socket.to(conferenceId).emit("conference:user-left");
    socket.leave(conferenceId);

    return true;
};

export const leaveAllConferenceRooms = (socket: Socket) => {
    const conferenceRooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id,
    );

    conferenceRooms.forEach((room) => {
        socket.to(room).emit("conference:user-left");
        socket.leave(room);
    });

    return conferenceRooms;
};

export const registerConferenceHandlers = (io: Server, socket: Socket) => {
    socket.on("disconnecting", () => {
        leaveAllConferenceRooms(socket);
    });

    socket.on("conference:join", (data) => {
        conferenceHandlers.handleConferenceJoin(io, socket, data);
    });

    socket.on("conference:leave", (data) => {
        conferenceHandlers.handleConferenceLeave(socket, data);
    });

    socket.on("conference:offer", (data) => {
        conferenceHandlers.handleConferenceOffer(socket, data);
    });

    socket.on("conference:answer", (data) => {
        conferenceHandlers.handleConferenceAnswer(socket, data);
    });

    socket.on("conference:ice-candidate", (data) => {
        conferenceHandlers.handleConferenceIceCandidate(socket, data);
    });
};
