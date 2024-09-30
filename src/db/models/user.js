import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
},
    {
        timestamps: true,
        versionKey: false
    },
);

userSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.password;
        return ret;
    }
});


export const UserCollection = model('users', userSchema);
