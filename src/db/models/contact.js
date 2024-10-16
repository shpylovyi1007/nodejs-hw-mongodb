import { Schema, model } from "mongoose";

const contactsSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
        photo: { type: String },
        contactType: {
            type: String,
            enum: ['work', 'home', 'personal'],
            required: true,
            default: 'personal',
        },
        userId: { type: Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
        versionKey: false
    },
);

export const ContactsCollection = model('contacts', contactsSchema);