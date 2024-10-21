import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserCollection } from "../db/models/user.js";
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/index.js';
import { SessionCollection } from '../db/models/session.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';
import { UserCollection } from "../db/models/user.js";

export const findUser = async ({ email }) => {
    return await UserCollection.findOne({ email });
};

export const registerUser = async (payload) => {

    const existingUser = await UserCollection.findOne({ email: payload.email });
    if (existingUser) {
        throw createHttpError(409, 'Email in use');
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    const newUser = await UserCollection.create({
        ...payload,
        password: encryptedPassword,
    });

    const { password, ...userWithoutPassword } = newUser.toObject();
    return userWithoutPassword;
};

export const loginUser = async (payload) => {
    const user = await UserCollection.findOne({ email: payload.email });

    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) {
        throw createHttpError(401, 'Unauthorized');
    }

    await SessionCollection.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return await SessionCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    });
};

export const logoutUser = async (sessionId) => {
    await SessionCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
    };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {

    const session = await SessionCollection.findOne({ _id: sessionId, refreshToken });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSession();

    await SessionCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionCollection.create({
        userId: session.userId,
        ...newSession
    });
};

export const requestResetToken = async (user) => {
    const { _id: userId, name: userName, email } = user;
    const passwordResetToken = createJwtToken({
        sub: userId,
        email,
    });

    const resetLink = `${env(
        'APP_DOMAIN',
    )}/reset-password?token=${passwordResetToken}`;

    const emailData = {
        to: email,
        subject: 'Reset password',
        html: generatePasswordResetEmail({
            userName,
            resetLink,
            currentYear,
        }),
    };

    return sendEmail(emailData);
};




export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    try {
        const user = await UserCollection.findOne({
            email: entries.email,
            _id: entries.sub,
        });

        if (!user) {
            throw createHttpError(404, 'User not found');
        }

        const encryptedPassword = await bcrypt.hash(payload.password, 10);

        await UserCollection.updateOne(
            { _id: user._id },
            { password: encryptedPassword },
        );
    } catch (error) {
        if (error.status === 404) {
            throw error;
        }
        throw createHttpError(500, 'Failed to reset password, please try again later.');
    }
};

