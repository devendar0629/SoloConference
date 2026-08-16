import type { Socket } from "socket.io";
import type { AnswerData } from "../validation-schemas/answer.schema";

export const handleConferenceAnswer = (socket: Socket, data: AnswerData) => {
    const conferenceId = data.conference_id;

    const responsePayload = {
        sdp: data.sdp,
    };

    socket.broadcast
        .to(conferenceId)
        .emit("conference:answer", responsePayload);
};
