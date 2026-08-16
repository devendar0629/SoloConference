import { handleConferenceJoin } from "./join.handler";
import { handleConferenceLeave } from "./leave.handler";
import { handleConferenceOffer } from "./offer.handler";
import { handleConferenceAnswer } from "./answer.handler";
import { handleConferenceIceCandidate } from "./ice-candidate.handler";

export default {
    handleConferenceJoin,
    handleConferenceLeave,
    handleConferenceOffer,
    handleConferenceAnswer,
    handleConferenceIceCandidate,
};
