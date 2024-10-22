import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { randomBytes } from 'crypto';
import {
    FIFTEEN_MINUTES,
    JWT,
    ONE_MONTH,
    SMTP,
    TEMPLATES_DIR,
} from '../constants/constants.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendMail } from '../utils/sendMail.js';

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

// import uuid from 'uuid';

const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
);

const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
).toString();

export const isUnicalEmale = (email) => UsersCollection.findOne({ email });

export const registerUser = async (userData) => {
    const encryptedPassword = await bcrypt.hash(userData.password, 10);

    return UsersCollection.create({ ...userData, password: encryptedPassword });
};

export const isEqualPassword = async (user, password) =>
    bcrypt.compare(password, user.password);

const createSession = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + ONE_MONTH),
    };
};

export const loginUser = async (user) => {
    await SessionsCollection.deleteOne({ userId: user._id });

    const newSession = createSession();

    return await SessionsCollection.create({
        userId: user._id,
        ...newSession,
    });
};

export const isEqualSession = ({ sessionId, refreshToken }) =>
    SessionsCollection.findOne({
        _id: sessionId,
        refreshToken,
    });

export const delateSession = ({ sessionId, refreshToken }) =>
    SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

export const refreshUsersSession = async (userId) => {
    const newSession = createSession();

    return await SessionsCollection.create({
        userId,
        ...newSession,
    });
};

export const requestResetToken = async (user) => {
    const resetToken = jwt.sign(
        { sub: user._id, email: user.email },
        env(JWT.JWT_SECRET),
        {
            expiresIn: '15m',
        },
    );

    const template = handlebars.compile(templateSource);
    const html = template({
        name: user.name,
        link: `${env('APP_DOMAIN')}/reset-password?token=${resetToken}`,
    });

    await sendMail({
        from: env(SMTP.SMTP_FROM),
        to: user.email,
        subject: 'Reset your password',
        html,
    });
};

export const verifyToken = (token) => jwt.verify(token, env('JWT_SECRET'));

export const findOneByIdAndEmail = ({ _id, email }) =>
    UsersCollection.findOne({ _id, email });

export const resetPassword = async ({ _id, password }) => {
    const encryptedPassword = await bcrypt.hash(password, 10);

    await UsersCollection.updateOne(
        { _id },
        {
            password: encryptedPassword,
        },
    );
};