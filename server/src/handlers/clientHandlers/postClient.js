const bcrypt = require('bcrypt');
const crypto = require('crypto');
const validation = require('../../utils/validations');

const postClient = async (req, res) => {
    try {
        const { business_name, password, tax_id, email, phone, address, contact_name, contact_phone } = req.body;
        
        if(!business_name || !password || !tax_id || !email)
        {
            throw Object.assign( new Error('Falta información clave para crear el cliente',
                {
                    status: 400,
                    code: 'MISSING_KEY_INFORMATION',
                    timestamp: new Date().toISOString()
                } ) );
        }

        if(!validation.isValidEmail(email))
        {
            throw Object.assign(
                new Error('Formato de email inválido'),
                {
                    status: 400,
                    code: "INVALID_EMAIL_FORMAT",
                    timestamp: new Date().toISOString()
                }
            )
        }

        if(!validation.isValidPassword(password))
        {
            throw Object.assign(
                new Error('Formato de contraseña inválido'),
                {
                    status: 400,
                    code: "INVALID_PASSWORD_FORMAT",
                    timestamp: new Date().toISOString()
                });
        }

        const hashedPassword = await bcrypt.hash( password, 10 );

        const fields = ['business_name', 'password', 'tax_id', 'email'];
        const values = [business_name, hashedPassword, tax_id, email];

        if(phone) { fields.push('phone'); values.push(phone) };
        if(address) { fields.push('address'); values.push(address) };
        if(contact_name) { fields.push('contact_name'); values.push(contact_name) };
        if(contact_phone) { fields.push('contact_phone'); values.push(contact_phone) };

        const verificationToken = crypto.randomBytes(32).toString('hex');
        fields.push('verification_token');
        values.push(verificationToken);

        const placeHolders = fields.map( () => '?' ).join(', ');
        const insertQuery = `INSERT INTO clients (${fields.join(', ')}) VALUES (${placeHolders})`;

        await req.pool.query( insertQuery, values );
        
        const [rows] = await req.pool.query( 'SELECT * FROM clients WHERE email = ?',[email] );
        
        delete rows[0].password;
        delete rows[0].verification_code;

        return res.status(201).json( rows[0] );
    } catch(error) {

        console.error('Error creando cliente:', error.code);

        if(error.code==='ER_DUP_ENTRY') return res.status(409).json( { error: 'El cliente ya existe' } );

        return res.status(error.status || 500).json({ error: error.message });
    }
}

module.exports = postClient;