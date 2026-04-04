const { validateEmail, validatePassword } = require("../../utils/validations");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginClient = async (req, res) => {
    const {email, password} = req.body;
    validateEmail(email);
    validatePassword(password);

    try {
        const [client] = await req.pool.query('SELECT * FROM clients WHERE email = ?', [ email ]);
        if(client.length===0) {
            throw Object.assign( new Error('Credenciales inválidas'),
            {
                status: 401,
                code: 'INVALID_CREDENTIALS',
                timestamp: new Date().toISOString()
            })
        }

        const correctPassword = await bcrypt.compare(password, client[0].password);
        if(!correctPassword) {
            throw Object.assign( new Error('Credenciales inválidas'),
            {
                status: 401,
                code: 'INVALID_CREDENTIALS',
                timestamp: new Date().toISOString()
            })
        }

        const cliente = { id: client[0].id, business_name: client[0].business_name, is_active: client[0].is_active, email: client[0].email, is_admin: client[0].is_admin };

        const [invoice] = await req.pool.query('SELECT id, status, created_at FROM invoices WHERE client_id = ?', [ client[0].id ]);

        const activeInvoice = invoice[0] || null;

        const token = jwt.sign( { id: client[0].id, is_admin: client[0].is_admin }, process.env.JWT_SECRET, {expiresIn: '7d'} );
        return res.status(200).json( { cliente, token, activeInvoice } );
    } catch(error) {
        console.error( "Error logeando el cliente:", error.code || error );
        return res.status(error.status||500).json( {message: error.message || error} );
    }
}

module.exports = loginClient;