const createError = (message, status = 400, code, extra = {}) => {
    const error = new Error(message);

    return Object.assign(error, {
        status,
        code,
        timestamp: new Date().toISOString(),
        ...extra
    } );
};

module.exports = createError;