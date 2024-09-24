import Joi from "joi";

export const createContactsSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    phoneNumber: Joi.string().min(3).max(20).required(),
    email: Joi.string().email(),
    isFavourite: Joi.boolean().falsy('N'),
    contactType: Joi.string().valid('work', 'home', 'personal').required()
});

const validationResult = createContactsSchema.validate('contacts');

if (!validationResult.error) {
    console.error(validationResult.error.message);
} else {
    console.log("Data is valid");
};

export const updateContactSchema = Joi.object({
    name: Joi.string().min(3).max(20),
    phoneNumber: Joi.string().min(3).max(20),
    email: Joi.string().email(),
    isFavourite: Joi.boolean().falsy('N'),
    contactType: Joi.string().valid('work', 'home', 'personal')
});
