import { Router } from "express";
import * as authController from "./auth.controller";
import * as authSchemas from "./auth.schema";
import { ensureRefreshToken } from "./auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";

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
