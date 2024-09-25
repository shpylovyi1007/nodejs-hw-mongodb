import { query } from "express";

export const parseFilterParams = (query) => {
    const { type, isFavourite } = query;

    const filter = {};

    if (type) {
        filter.contactType = type;
    }

    if (isFavourite !== undefined) {
        filter.isFavourite = isFavourite === 'true';
    }

    return filter;
};