import e from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = e();

app.use(e.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [],
        credentials: true,
    }),
);

import { jwtMiddleware } from "./middleware/jwt.middleware";
import { ensureUserIsAuthenticated } from "./middleware/auth.middleware";

app.use(jwtMiddleware);

import userRouter from "./modules/user/user.routes";
import authRouter from "./modules/auth/auth.routes";
import conferenceRouter from "./modules/conference/conference.routes";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", ensureUserIsAuthenticated, userRouter);
app.use("/api/v1/conferences", ensureUserIsAuthenticated, conferenceRouter);

export { app };
