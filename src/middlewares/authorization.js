import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contact.js';

export const authorization = async (req, res, next) => {
    const { contactId } = req.params;
    const contact = await ContactsCollection.findById(contactId);

    if (!contact || contact.userId.toString() !== req.userId.toString()) {
        return next(createHttpError(404, 'Contact not found or access denied!'));
    }

    req.contact = contact;
    next();
};