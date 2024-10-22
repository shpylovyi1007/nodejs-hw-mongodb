import { SORT_ORDER } from '../constants/constants.js';
import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
    page = 1,
    perPage = 10,
    sortOrder = SORT_ORDER.ASC,
    sortBy = '_id',
    filter = {},
    userId,
}) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactsCollection.find({ userId });

    if (filter.contactType)
        contactsQuery.where('contactType').equals(filter.contactType);
    if (filter.isFavourite)
        contactsQuery.where('isFavourite').equals(filter.isFavourite);

    const contactsCount = await ContactsCollection.find()
        .merge(contactsQuery)
        .countDocuments();

    const contacts = await contactsQuery
        .find()
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .exec();

    const paginationData = calculatePaginationData(contactsCount, perPage, page);

    return { data: contacts, ...paginationData };
};

export const getContactById = async (userId, contactId) =>
    ContactsCollection.findOne({ userId, _id: contactId });

export const createContact = async (userData) =>
    ContactsCollection.create({ ...userData });

export const delateContact = async (contactId, userId) =>
    ContactsCollection.findOneAndDelete({
        _id: contactId,
        userId,
    });

export const updateContact = async (
    contactId,
    payload,
    options = {},
    userId,
) => {
    const rawResult = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId },
        { ...payload },
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