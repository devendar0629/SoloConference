import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authSchemas from "./auth.schema.js";
import { ensureRefreshToken } from "./auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";

const authRouter = Router();

authRouter.post(
    "/login",
    validateBody(authSchemas.loginSchema),
    authController.login,
);

authRouter.post(
    "/signup",
    validateBody(authSchemas.signupSchema),
    authController.signup,
);

authRouter.post(
    "/refresh-token",
    ensureRefreshToken,
    authController.getAccessToken,
);

export default authRouter;
