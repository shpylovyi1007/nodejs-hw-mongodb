import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
    registerUserSchema,
    loginUserSchema,
    requestResetTokenSchema,
    resetPasswordSchema,
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
    loginUserController,
    logoutUserController,
    refreshUserController,
    registerUserController,
    requestResetTokenController,
    resetPasswordController,
} from '../controllers/auth.js';

const router = Router();

router.post(
    '/register',
    validateBody(registerUserSchema),
    ctrlWrapper(registerUserController),
);

router.post(
    '/login',
    validateBody(loginUserSchema),
    ctrlWrapper(loginUserController),
);

router.post('/refresh', ctrlWrapper(refreshUserController));

router.post('/logout', ctrlWrapper(logoutUserController));

router.post(
    '/send-reset-email',
    validateBody(requestResetTokenSchema),
    ctrlWrapper(requestResetTokenController),
);

router.post('/reset-pwd', validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

export default router;