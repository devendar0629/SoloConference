import type { Socket } from "socket.io";
import type { LeaveData } from "../validation-schemas/leave.schema.js";

export const handleConferenceLeave = (socket: Socket, data: LeaveData) => {
    const conferenceId = data?.conference_id;

    if (!socket.rooms.has(conferenceId)) {
        socket.emit("conference:NOT_IN_ROOM");

        return;
    }

    socket.leave(conferenceId);

    socket.to(conferenceId).emit("conference:user-left", {
        socket_id: socket.id,
    });
};
