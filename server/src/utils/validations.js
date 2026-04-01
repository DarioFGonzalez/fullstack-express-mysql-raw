const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]{3,}@([^\s@]+\.)+[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const tokenRegex = /^[0-9a-f]{64}$/i;

const isValidUUID = (uuid) => {
    if(!uuid || typeof uuid !== 'string') return false;
    return uuidRegex.test(uuid);
}

const isValidEmail = (email) => {
    if(!email || typeof email !== 'string') return false;
    return emailRegex.test(email);
}

const isValidPassword = (password) => {
    if(!password || typeof password !== 'string') return false;
    return passwordRegex.test(password);
}

const isValidToken = (token) => {
    if(!token || typeof token !== 'string') return false;
    return tokenRegex.test(token);
}

const validateId = (id) => {
        if(!id)
        {
            throw Object.assign( new Error('ID no recibido'),
            {
                status: 400,
                code: "NO_ID_RECEIVED",
                timestamp: new Date().toISOString()
            })
        }
        if(!isValidUUID(id))
        {
            throw Object.assign( new Error('Formato del ID inválido'),
            {
                status:400,
                code: "INVALID_ID_FORMAT",
                timestamp: new Date().toISOString()
            })
        }
        return true;
}

const validatePaymentTerms = (payment_terms) => {
    if(!payment_terms)
    {
        throw Object.assign( new Error('Términos de pago no encontrados'),
        {
            status: 400,
            code: "PAYMENT_TERMS_NOT_FOUND",
            timestamp: new Date().toISOString()
        })
    }
    const allowedPaymentTerms = [ '30', '60', '90', '120' ];
    if(!allowedPaymentTerms.includes(payment_terms))
    {
        throw Object.assign( new Error('Término de pago no válido'),
        {
            status: 400,
            code: 'INVALID_PAYMENT_TERM',
            timestamp: new Date().toISOString()
        })
    }
    return true;
}

module.exports = {
    isValidUUID, isValidEmail, isValidPassword, isValidToken,
    validateId, validatePaymentTerms,
 };