import { loginUser, logoutUser, registerUser, requestResetToken, findUser } from "../services/auth.js"
import { refreshUsersSession } from '../services/auth.js';
import { ONE_DAY } from "../constants/index.js";
import { resetPassword } from '../services/auth.js';
import createHttpError from "http-errors";


export const registerUserControler = async (req, res) => {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: 'Successfully registered a user!',
        data: user
    });

};

export const loginUserControler = async (req, res) => {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });

    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });

    res.json({
        status: 200,
        message: 'Successfully logged in an user!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const logoutUserControler = async (req, res) => {
    if (req.cookies.sessionId) {
        await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
};

const setupSession = (res, session) => {
    res.cookie('refreshToken', session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });
    res.cookie('sessionId', session._id, {
        httpOnly: true,
        expires: new Date(Date.now() + ONE_DAY),
    });
};


export const refreshUserSessionController = async (req, res) => {
    const session = await refreshUsersSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
        status: 200,
        message: 'Successfully refreshed a session!',
        data: {
            accessToken: session.accessToken,
        },
    });
};

export const requestResetEmailController = async (req, res) => {
    const { email } = req.body;
    const user = await findUser({ email });
    if (!user) {
        throw createHttpError(404, 'User not found!');
    };

    try {
        await requestResetToken(user);
    } catch (error) {
        throw createHttpError(
            500,
            'Failed to send the email, please try again later.',
            error,
        );
    }

    res.json({
        status: 200,
        message: 'Reset password email was successfully sent.',
        data: {},
    });
};

export const resetPasswordController = async (req, res) => {
    await resetPassword(req.body);
    res.json({
        message: 'Password was successfully reset!',
        status: 200,
        data: {},
    });
};