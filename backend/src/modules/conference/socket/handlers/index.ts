import { handleConferenceJoin } from "./join.handler.js";
import { handleConferenceLeave } from "./leave.handler.js";
import { handleConferenceOffer } from "./offer.handler.js";
import { handleConferenceAnswer } from "./answer.handler.js";
import { handleConferenceIceCandidate } from "./ice-candidate.handler.js";

export default {
    handleConferenceJoin,
    handleConferenceLeave,
    handleConferenceOffer,
    handleConferenceAnswer,
    handleConferenceIceCandidate,
};
