import type { Socket } from "socket.io";
import type { OfferData } from "../validation-schemas/offer.schema";

export const handleConferenceOffer = (socket: Socket, data: OfferData) => {
    const conferenceId = data.conference_id;

    const responsePayload = {
        sdp: data.sdp,
    };

    socket.broadcast.to(conferenceId).emit("conference:offer", responsePayload);
};
