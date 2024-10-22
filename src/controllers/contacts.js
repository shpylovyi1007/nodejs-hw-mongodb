import createHttpError from 'http-errors';
import {
    createContact,
    delateContact,
    getAllContacts,
    getContactById,
    updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllContactsController = async (req, res) => {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts({
        page,
        perPage,
        sortBy,
        sortOrder,
        filter,
        userId: req.userId,
    });

    if (!contacts) throw createHttpError(404, 'Contacts not found');

    res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
    });
};

export const getContactByIdController = async (req, res) => {
    const { contactId } = req.params;
    const { userId } = req;
    const contact = await getContactById(userId, contactId);

    if (!contact) throw createHttpError(404, 'Contact not found');

    res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    const userId = req.userId;
    const photo = req.file;

    let photoUrl;

    if (env('ENABLE_CLOUDINARY') === 'true' && photo) {
        photoUrl = await saveFileToCloudinary(photo);
    } else if (photo) {
        photoUrl = await saveFileToUploadDir(photo);
    }

    const contact = await createContact({ ...req.body, userId, photo: photoUrl });

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const patchContactController = async (req, res) => {
    const { contactId } = req.params;
    const userId = req.userId;
    const photo = req.file;

    let photoUrl;

    if (env('ENABLE_CLOUDINARY') === 'true' && photo) {
        photoUrl = await saveFileToCloudinary(photo);
    } else if (photo) {
        photoUrl = await saveFileToUploadDir(photo);
    }

    const result = await updateContact(
        contactId,
        { ...req.body, photo: photoUrl },
        {},
        userId,
    );

    if (!result) throw createHttpError(404, 'Contact not found');

    res.status(200).json({
        status: 200,
        message: 'Successfully patched a contact!',
        data: result.contact,
    });
};

export const upsertContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const userId = req.userId;
    let photo = req.file;

    let photoUrl;

    if (env('ENABLE_CLOUDINARY') === 'true' && photo) {
        photoUrl = await saveFileToCloudinary(photo);
    } else if (photo) {
        photoUrl = await saveFileToUploadDir(photo);
    }

    const result = await updateContact(
        contactId,
        { ...req.body, photo: photoUrl },
        {
            upsert: true,
        },
        userId,
    );

    if (!result) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    const status = result.isNew ? 201 : 200;

    res.status(status).json({
        status,
        message: 'Successfully upserted a contact!',
        data: result.contact,
    });
};

export const delateContactController = async (req, res) => {
    const { contactId } = req.params;
    const userId = req.userId;

    const contact = await delateContact(contactId, userId);

    if (!contact) throw createHttpError(404, 'Contact not found');

    res.sendStatus(204);
};