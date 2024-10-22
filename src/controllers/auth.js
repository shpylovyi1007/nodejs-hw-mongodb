import { ONE_MONTH } from '../constants/constants.js';
import {
    isUnicalEmale,
    loginUser,
    registerUser,
    isEqualPassword,
    refreshUsersSession,
    isEqualSession,
    delateSession,
    requestResetToken,
    verifyToken,
    findOneByIdAndEmail,
    resetPassword,
} from '../services/auth.js';
import createHttpError from 'http-errors';

export const registerUserController = async (req, res) => {
    const { email } = req.body;
    const takenEmail = await isUnicalEmale(email);
    if (takenEmail) throw createHttpError(409, 'Email in use');

    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user,
    });
};

export const loginUserController = async (req, res) => {
    const { password, email } = req.body;

    const user = await isUnicalEmale(email);
    if (!user) throw createHttpError(409, 'Email no use');

    const isEqual = await isEqualPassword(user, password);
    if (!isEqual) throw createHttpError(401, 'Unauthorized');

    const session = await loginUser(user);

    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_MONTH),
    });

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_MONTH),
    });

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_MONTH),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_MONTH),
    });
};

export const refreshUserController = async (req, res) => {
    const session = await isEqualSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    if (!session) throw createHttpError(401, 'Session not found');

    const isSessionTokenExpired =
        new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    await delateSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    const refreshedSession = await refreshUsersSession(session.userId);

    setupSession(res, refreshedSession);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
            accessToken: refreshedSession.accessToken,
        },
    });
};

export const logoutUserController = async (req, res) => {
    const { sessionId, refreshToken } = req.cookies;
    if (sessionId) await delateSession({ sessionId, refreshToken });

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.sendStatus(204);
};

export const requestResetTokenController = async (req, res) => {
    const { email } = req.body;

    const user = await isUnicalEmale(email);

    if (!user) throw createHttpError(404, 'User not found!');

    try {
        await requestResetToken(user);
    } catch (err) {
        console.log(err);

        throw createHttpError(
            500,
            'Failed to send the email, please try again later.',
        );
    }

    res.status(200).json({
        status: 200,
        message: 'Reset password email has been successfully sent.',
        data: [],
    });
};

export const resetPasswordController = async (req, res) => {
    const { token, password } = req.body;

    let entries;

    try {
        entries = await verifyToken(token);
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    const user = await findOneByIdAndEmail({
        _id: entries.sub,
        email: entries.email,
    });

    if (!user) {
        throw createHttpError(404, 'User not found!');
    }

    await resetPassword({ _id: user._id, password });

    res.json({
        message: 'Password was successfully reset!',
        status: 200,
        data: {},
    });
};