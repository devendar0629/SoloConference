import type { Socket } from "socket.io";
import type { IceCandidateData } from "../validation-schemas/ice-candidate.schema";

export const handleConferenceIceCandidate = (
    socket: Socket,
    data: IceCandidateData,
) => {
    const conferenceId = data.conference_id;

    const responsePayload = {
        iceCandidate: data.iceCandidate,
    };

    socket.broadcast
        .to(conferenceId)
        .emit("conference:ice-candidate", responsePayload);
};
