import Joi from 'joi';

export const createContactsSchema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    phoneNumber: Joi.string().min(6).max(15).required(),
    email: Joi.string().email(),
    isFavourite: Joi.boolean().truthy('true').falsy('false'),
    contactType: Joi.string().valid('work', 'home', 'personal').required(),
});

export const patchContactsSchema = Joi.object({
    name: Joi.string().min(3).max(20).optional(),
    phoneNumber: Joi.string().min(6).max(15).optional(),
    email: Joi.string().email().optional(),
    photo: Joi.string().optional(),
    isFavourite: Joi.boolean().truthy('true').falsy('false').optional(),
    contactType: Joi.string().valid('work', 'home', 'personal').optional(),
}).min(1); 