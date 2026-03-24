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

module.exports = { isValidUUID, isValidEmail, isValidPassword, isValidToken };