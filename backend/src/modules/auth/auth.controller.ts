import type { RequestHandler } from "express";
import { type LoginBody, type SignupBody } from "./auth.schema";
import { db } from "../../db";
import { UsersTable } from "../../db/schema";
import argon2 from "argon2";
import jsonwebtoken from "jsonwebtoken";
import {
    ACCESS_TOKEN_EXPIRY_SECONDS,
    REFRESH_TOKEN_EXPIRY_SECONDS,
} from "../../config/constants";

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
            error: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
        });
    }

    const isCorrectPassword = await argon2.verify(user.password, password);
    if (!isCorrectPassword) {
        return res.status(400).json({
            error: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
        });
    }

    const accessTokenPayload = {
        id: user.id,
    };
    const accessToken = jsonwebtoken.sign(
        accessTokenPayload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
            algorithm: "HS256",
        },
    );

    const refreshTokenPayload = {
        id: user.id,
    };
    const refreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
            algorithm: "HS256",
        },
    );

    return res
        .status(200)
        .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
        })
        .json({
            message: "Login successful",
            data: user,
            accessToken,
        });
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
    const accessTokenPayload = {
        id: req.user.id,
    };
    const accessToken = jsonwebtoken.sign(
        accessTokenPayload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
            algorithm: "HS256",
        },
    );

    const refreshTokenPayload = {
        id: req.user.id,
    };
    const refreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
            algorithm: "HS256",
        },
    );

    return res
        .status(200)
        .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: REFRESH_TOKEN_EXPIRY_SECONDS,
        })
        .json({
            message: "Success",
            data: accessToken,
        });
};
