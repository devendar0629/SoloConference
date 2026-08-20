import type { CookieOptions, RequestHandler } from "express";
import { type LoginBody, type SignupBody } from "./auth.schema.js";
import { db } from "../../db/index.js";
import { UsersTable } from "../../db/schema/index.js";
import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import {
    ACCESS_TOKEN_EXPIRY_MS,
    IS_DEVELOPMENT,
    REFRESH_TOKEN_EXPIRY_MS,
} from "../../config/constants.js";

export const login: RequestHandler<any, any, LoginBody, any> = async (
    req,
    res,
) => {
    const { email, password } = req.body;

    const user = await db.query.UsersTable.findFirst({
        where: (fields, operators) => operators.eq(fields.email, email),
    });

    if (!user) {
        return res.status(400).json({
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
        });
    }

    const isCorrectPassword = await argon2.verify(user.password, password);
    if (!isCorrectPassword) {
        return res.status(400).json({
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
        });
    }

    // Generate access token
    const accessTokenPayload = {
        id: user.id,
    };
    const accessToken = jsonwebtoken.sign(
        accessTokenPayload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY_MS,
            algorithm: "HS256",
        },
    );

    // Generate refresh token
    const refreshTokenPayload = {
        id: user.id,
    };
    const refreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY_MS,
            algorithm: "HS256",
        },
    );

    const responsePayload = {
        message: "Login successful",
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
    };

    const refreshTokenCookieOptions: CookieOptions = {
        httpOnly: true,
        secure: IS_DEVELOPMENT,
        sameSite: IS_DEVELOPMENT ? "none" : "lax",
        maxAge: REFRESH_TOKEN_EXPIRY_MS,
        path: "/api/v1/auth",
    };

    return res
        .status(200)
        .cookie("refresh_token", refreshToken, refreshTokenCookieOptions)
        .json(responsePayload);
};

export const signup: RequestHandler<any, any, SignupBody, any> = async (
    req,
    res,
) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await db.query.UsersTable.findFirst({
            where(fields, operators) {
                return operators.or(operators.eq(fields.email, email));
            },
        });

        if (existingUser) {
            return res.status(400).json({
                code: "EMAIL_ALREADY_EXISTS",
                message: "Email already exists",
            });
        }

        const hashedPassword = await argon2.hash(password);

        const [newUser] = await db
            .insert(UsersTable)
            .values({ name, email, password: hashedPassword })
            .returning({
                id: UsersTable.id,
                name: UsersTable.name,
                email: UsersTable.email,
            });

        return res.status(201).json({
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAccessToken: RequestHandler = async (req, res) => {
    // Generate new access token
    const accessTokenPayload = {
        id: req.user.id,
    };
    const accessToken = jsonwebtoken.sign(
        accessTokenPayload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY_MS,
            algorithm: "HS256",
        },
    );

    // Generate new refresh token
    const refreshTokenPayload = {
        id: req.user.id,
    };
    const refreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY_MS,
            algorithm: "HS256",
        },
    );

    const user = await db.query.UsersTable.findFirst({
        where: (fields, operators) => operators.eq(fields.id, req.user.id),
    });

    if (!user) {
        return res.status(404).json({
            code: "USER_NOT_FOUND",
            message: "User not found",
        });
    }

    const responsePayload = {
        message: "Success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            accessToken,
        },
    };

    const refreshTokenCookieOptions: CookieOptions = {
        httpOnly: true,
        secure: IS_DEVELOPMENT,
        sameSite: IS_DEVELOPMENT ? "none" : "lax",
        maxAge: REFRESH_TOKEN_EXPIRY_MS,
        path: "/api/v1/auth",
    };

    return res
        .status(200)
        .cookie("refresh_token", refreshToken, refreshTokenCookieOptions)
        .json(responsePayload);
};

export const logout: RequestHandler = async (req, res) => {
    const refreshTokenCookieOptions: CookieOptions = {
        httpOnly: true,
        secure: IS_DEVELOPMENT,
        sameSite: IS_DEVELOPMENT ? "none" : "lax",
        maxAge: 0,
        path: "/api/v1/auth",
    };

    return res
        .status(200)
        .clearCookie("refresh_token", refreshTokenCookieOptions)
        .json({ message: "Successfully logged out" });
};
