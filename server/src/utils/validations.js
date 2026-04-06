const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]{3,}@([^\s@]+\.)+[^\s@]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const tokenRegex = /^[0-9a-f]{64}$/i;

const selectedFields = 'id, business_name, tax_id, email, phone, address, contact_name, contact_phone, created_at, updated_at, last_login, status, is_admin, email_verified_at';

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

const validateToken = (token) => {
    if(!token) {
        throw Object.assign( new Error('Falta el token'),
        {
            status: 400,
            code: 'MISSING_VERIFICATION_TOKEN',
            timestamp: new Date().toISOString()
        })
    }
    if(isValidToken(token)) {
        return true;
    }

    throw Object.assign( new Error ('Formato del token no válido'),
    {
        status: 400,
        code: 'INVALID_TOKEN_FORMAT',
        timestamp: new Date().toISOString()
    } );    
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

const validateEmail = (email) => {
    if(!email) {
        throw Object.assign( new Error('Email no recibido'),
        {
            status: 400,
            code: 'MISSING_EMAIL',
            timestamp: new Date().toISOString()
        })
    }
    if(!emailRegex.test(email)) {
        throw Object.assign( new Error('Formato de email inválido'),
        {
            status: 400,
            code: 'INVALID_EMAIL_FORMAT',
            timestamp: new Date().toISOString()
        })
    };

    return true;
}

const validatePassword = (password) => {
    if(!password) {
        throw Object.assign( new Error('Password no recibido'),
        {
            status: 400,
            code: 'MISSING_PASSWORD',
            timestamp: new Date().toISOString()
        })
    }
    if(!passwordRegex.test(password)) {
        throw Object.assign( new Error('Formato de contraseña inválido'),
        {
            status: 400,
            code: 'INVALID_PASSWORD_FORMAT',
            timestamp: new Date().toISOString()
        })
    }

    return true;
}

module.exports = {
    selectedFields,
    isValidUUID, isValidEmail, isValidPassword, isValidToken,
    validateId, validateEmail, validatePassword, validateToken,
    validatePaymentTerms,
 };