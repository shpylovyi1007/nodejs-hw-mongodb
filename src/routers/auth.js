import { Router } from "express";
import { validateBody } from '../middlewares/validateBody.js'
import { loginUserSchema, registerUserSchema, requestResetEmailSchema } from "../validation/auth.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { loginUserControler, logoutUserControler, registerUserControler, requestResetEmailController } from "../controllers/auth.js";
import { refreshUserSessionController } from '../controllers/auth.js';
import { resetPasswordSchema } from '../validation/auth.js';
import { resetPasswordController } from '../controllers/auth.js';

const router = Router();

router.post('/register',
    validateBody(registerUserSchema),
    ctrlWrapper(registerUserControler)
);

router.post('/login',
    validateBody(loginUserSchema),
    ctrlWrapper(loginUserControler)
);

router.post('/logout', ctrlWrapper(logoutUserControler));

router.post('/refresh', ctrlWrapper(refreshUserSessionController));

router.post(
    '/request-reset-email', validateBody(requestResetEmailSchema),
    ctrlWrapper(requestResetEmailController)
);

router.post(
    '/reset-password',
    validateBody(resetPasswordSchema),
    ctrlWrapper(resetPasswordController),
);

export default router;