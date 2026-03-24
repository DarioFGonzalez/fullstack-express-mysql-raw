const validation = require('../../services/validations');
const selectedFields = 'id, business_name, tax_id, email, phone, address, contact_name, contact_phone, created_at, updated_at, last_login, verified_at';

const getAllClients = async (req, res) => {
    try {
        const [rows] = await req.pool.query(`SELECT ${selectedFields} FROM clients`);

        return res.status(200).json(rows);
    }
    catch(error) {
        console.error('Error en clients/all:', error);
        res.status(500).json( { error: error.message  } );
    }
}

const getClientsByQuery = async (req, res) => {
    try {
        const {business_name, email} = req.query;

        if(business_name)
        {
            const [rows] = await req.pool.query(`SELECT ${selectedFields} FROM clients WHERE business_name LIKE ?`, [`%${business_name}%`]);
            if(rows.length===0)
            {
                throw Object.assign(
                    new Error('Cliente con ese business_name no encontrado en la base de datos',
                        {
                            status: 404,
                            code: 'BUSINESS_NAME_NOT_FOUND',
                            timestamp: new Date().toISOString()
                        } ) );
            }

            return res.status(200).json(rows);
        }

        if(email)
        {
            if(!validation.isValidEmail(email))
            {
                throw Object.assign( new Error('Email con formato inválido'),
                {
                  status: 400,
                  code: 'INVALID_EMAIL_FORMAT',
                  timestamp: new Date().toISOString()  
                } );
            }

            const [rows] = await req.pool.query(`SELECT ${selectedFields} FROM clients WHERE email = ?`, [email]);
            
            if(rows.length===0)
            {
                throw Object.assign( new Error('Cliente con ese mail no encontrado'),
                    {
                        status: 404,
                        code: "EMAIL_NOT_FOUND",
                        timestamp: new Date().toISOString()
                    } );
            }

            return res.status(200).json(rows[0]);
        }
    }
    catch(error) {
        console.error('Error en /clients:', error.code || error);
        res.status(error.status || 500).json( { error: error.message || 'Error interno' } );
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!validation.isValidUUID(id))
        {
            throw Object.assign( new Error('ID Inválido'),
                {
                    status: 400,
                    code: "INVALID_ID_FORMAT",
                    timestamp: new Date().toISOString()
                } );
        }

        const [rows] = await req.pool.query(`SELECT ${selectedFields} FROM clients WHERE id = ?`, [id]);
        if(rows.length===0)
        {
            throw Object.assign(
                new Error('Cliente con esa ID no encontrado en la base de datos'),
                {
                    status: 404,
                    code: "CLIENT_ID_NOT_FOUND",
                    timestamp: new Date().toISOString()
                });
        }

        res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error en /clients/:id:', error);
        res.status(500).json( { error: 'Error al traer el cliente por id' } );
    }
};

module.exports = { getAllClients, getClientById, getClientsByQuery };