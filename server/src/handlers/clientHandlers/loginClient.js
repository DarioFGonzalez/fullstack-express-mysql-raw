const { validateEmail, validatePassword } = require("../../utils/validations");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createError = require("../../utils/errorBuilder");

const loginClient = async (req, res) => {
    const {email, password} = req.body;
    
    try {
        validateEmail(email);
        validatePassword(password);
        const fields = 'id, password';

        const [client] = await req.pool.query(`SELECT ${fields} FROM clients WHERE email = ?`, [ email ]);
        if(client.length===0) {
            throw createError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
        }

        const correctPassword = await bcrypt.compare(password, client[0].password);
        if(!correctPassword) {
            throw createError('Credenciales inváldas', 401, 'INVALID_CREDENTIALS');
        }
        
        delete client[0].password;

        const token = jwt.sign( client[0], process.env.JWT_SECRET, {expiresIn: '7d'} );
        return res.status(200).json( { token } );
    } catch(error) {
        console.error( "Error logeando el cliente:", error.code || error );
        return res.status(error.status||500).json( {message: error.message || error} );
    }
}

module.exports = loginClient;