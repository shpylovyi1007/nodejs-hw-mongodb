import { ContactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../constants/index.js"

export const getAllContact = async ({ page, perPage, sortOrder = SORT_ORDER.ASC,
    sortBy = '_id', filter = {}, userId }) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;
    const userFilter = { ...filter, userId };

    const contactQuery = ContactsCollection.find(userFilter);

    const contactCount = await ContactsCollection.find().merge(contactQuery).countDocuments(userFilter);

    const contacts = await contactQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec();
    const paginationData = calculatePaginationData(contactCount, perPage, page);

    return {
        data: contacts,
        ...paginationData
    };
};

export const getContactById = async (contactId, userId) => {
    const contact = await ContactsCollection.findOne({ _id: contactId, userId });

    return contact;
};

export const createContact = async (payload) => {
    const contact = await ContactsCollection.create(payload);

    return contact;
};

export const updateContact = async (contactId, userId, payload, options = {}) => {
    const rawResult = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId },
        payload,
        {
            new: true,
            includeResultMetadata: true,
            ...options,
        },
    );

    if (!rawResult || !rawResult.value) return null;

    return {
        contact: rawResult.value,
        isNew: Boolean(rawResult?.lastErrorObject?.upserted),
    };
};

export const deleteContact = async (contactId, userId) => {
    const contact = await ContactsCollection.findOneAndDelete({ _id: contactId, userId },);

    return contact;
};