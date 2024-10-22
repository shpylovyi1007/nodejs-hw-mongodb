const parseContactType = (type) => {
    const isString = typeof type === 'string';
    if (!isString) return;

    const isContactType = (type) => ['work', 'home', 'personal'].includes(type);
    if (isContactType(type)) return type;
};

const parseFavourite = (type) => {
    const isString = typeof type === 'string';
    if (!isString) return;

    const isType = (type) => ['true', 'false'].includes(type);
    if (!isType) return;

    return type === 'true' ? true : false;
};

export const parseFilterParams = (query) => {
    const { contactType, isFavourite } = query;

    const parsedContactType = parseContactType(contactType);
    const parsedIsFavourite = parseFavourite(isFavourite);

    return {
        contactType: parsedContactType,
        isFavourite: parsedIsFavourite,
    };
};