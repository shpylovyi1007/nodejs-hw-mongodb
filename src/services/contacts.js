import { contactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../constants/index.js"

export const getAllContact = async ({ page, perPage, sortOrder = SORT_ORDER.ASC,
    sortBy = '_id', filter = {} }) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactQuery = contactsCollection.find(filter);

    const contactCount = await contactsCollection.find().merge(contactQuery).countDocuments(filter);

    const contacts = await contactCount.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec();
    const paginationData = calculatePaginationData(contactCount, perPage, page);


    return {
        data: contacts,
        ...paginationData
    };
};

export const getContactById = async (contactId) => {
    const contact = await contactsCollection.findById(contactId);

    return contact;
};

export const createContact = async (payload) => {
    const contact = await contactsCollection.create(payload);

    return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
    const rawResult = await contactsCollection.findOneAndUpdate(
        { _id: contactId },
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

export const deleteContact = async (contactId) => {
    const contact = await contactsCollection.findByIdAndDelete({ _id: contactId });

    return contact;
};