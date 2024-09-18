import { contactsCollection } from "../db/models/student.js";

export const getAllContact = async () => {
    const contacts = await contactsCollection.find();

    return contacts;
};

export const getContactById = async (contactId) => {
    const contact = await contactsCollection.findById(contactId);

    return contact;
}