import { Router } from "express";
import * as conferenceController from "./conference.controller.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import * as conferenceSchemas from "./conference.schema.js";

const router = Router();

router.post(
    "/create",
    validateBody(conferenceSchemas.createConferenceSchema),
    conferenceController.createConference,
);
router.get("/all", conferenceController.getAllConferences);
router.get("/:conference_id", conferenceController.getConference);
router.delete("/all", conferenceController.deleteAllConferences);

export default router;
