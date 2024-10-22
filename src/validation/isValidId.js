import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export const isValidId = (req, _, next) => {
    const { contactId } = req.params;
    if (!isValidObjectId(contactId)) throw createHttpError(400, 'Invalid id!');
    next();
};