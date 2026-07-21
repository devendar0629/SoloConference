import { Router } from "express";
import * as conferenceController from "./conference.controller";
import { validateBody } from "../../middleware/validate.middleware";
import * as conferenceSchemas from "./conference.schema";

const router = Router();

router.post(
    "/create",
    validateBody(conferenceSchemas.createConferenceSchema),
    conferenceController.createConference,
);
router.get("/all", conferenceController.getAllConferences);

export default router;
