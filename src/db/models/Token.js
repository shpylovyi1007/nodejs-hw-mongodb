import { model, Schema } from 'mongoose';

const UsedTokensSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
    },
    { timestamps: false, versionKey: false },
);

export const UsedTokensCollections = model('usedTokens', UsedTokensSchema);