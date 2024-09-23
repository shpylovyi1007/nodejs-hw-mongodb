import { contactsCollection } from "../db/models/contact.js";

export const getAllContact = async () => {
    const contacts = await contactsCollection.find();

    return contacts;
};

export const getContactById = async (contactId) => {
    const contact = await contactsCollection.findById(contactId);

    return contact;
};

export const createContact = async (payload) => {
    const contact = await contactsCollection.create(payload);

    return contact;
};

export const updateContact = async (contactId, payload) => {
    const rawResult = await contactsCollection.findOneAndUpdate(
        { _id: contactId },
        { $set: payload },
        { returnDocument: 'after' }
    );
    return rawResult;
};

export const deleteContact = async (contactId) => {
    const contact = await contactsCollection.findByIdAndDelete({ _id: contactId });

    return contact;
};