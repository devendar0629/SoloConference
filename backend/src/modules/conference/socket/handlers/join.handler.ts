import type { Server, Socket } from "socket.io";
import type { JoinData } from "../validation-schemas/join.schema.js";

export const handleConferenceJoin = (
    io: Server,
    socket: Socket,
    data: JoinData,
) => {
    const conferenceId = data.conference_id;

    // Prevent joining the same conference multiple times
    if (socket.rooms.has(conferenceId)) {
        socket.emit("conference:join-failed", {
            code: "ALREADY_JOINED",
            message: "You have already joined this conference.",
        });

        return;
    }

    const userConferences = Array.from(socket.rooms).filter(
        (room) => room !== socket.id,
    );

    // Prevent joining multiple conferences at the same time
    if (userConferences.length > 0) {
        socket.emit("conference:join-failed", {
            code: "ALREADY_IN_CONFERENCE",
            message: "You are already in another conference.",
        });

        return;
    }

    const usersInConference =
        io.sockets.adapter.rooms.get(conferenceId)?.size || 0;

    // Limit the number of users in a conference to 2
    if (usersInConference >= 2) {
        socket.emit("conference:join-failed", {
            code: "CONFERENCE_FULL",
            message:
                "This conference room is full. Maximum of 2 participants allowed.",
        });

        return;
    }

    socket.join(conferenceId);

    socket.broadcast.to(conferenceId).emit("conference:new-user-joined", {
        conference_id: conferenceId,
        socket_id: socket.id,
    });
};
