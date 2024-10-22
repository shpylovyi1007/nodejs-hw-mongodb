import { Router } from 'express';
import {
    createContactController,
    delateContactController,
    getAllContactsController,
    getContactByIdController,
    patchContactController,
    upsertContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
    createContactsSchema,
    patchContactsSchema,
} from '../validation/contacts.js';
import { isValidId } from '../validation/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorization } from '../middlewares/authorization.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getAllContactsController));

router.get(
    '/:contactId',
    isValidId,
    authorization,
    ctrlWrapper(getContactByIdController),
);

router.post(
    '/',
    upload.single('photo'),
    validateBody(createContactsSchema),
    ctrlWrapper(createContactController),
);

router.patch(
    '/:contactId',
    isValidId,
    authorization,
    upload.single('photo'),
    validateBody(patchContactsSchema),
    ctrlWrapper(patchContactController),
);

router.put(
    '/:contactId',
    isValidId,
    authorization,
    upload.single('photo'),
    validateBody(createContactsSchema),
    ctrlWrapper(upsertContactController),
);

router.delete(
    '/:contactId',
    isValidId,
    authorization,
    ctrlWrapper(delateContactController),
);

export default router;