const isValidUUID = require('../../services/validations');

const getClients = async (req, res) => {
    try {
        const {business_name} = req.query;
        if(business_name)
        {
            const [rows] = await req.pool.query('SELECT * FROM clients WHERE business_name = ?', [business_name]);
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

        const [rows] = await req.pool.query("SELECT * FROM clients");
        if(rows.length===0)
        {
            throw Object.assign(
                new Error('Base de datos sin clientes cargados',
                    {
                        status: 404,
                        code: 'NO_CLIENTS_FOUND',
                        timestamp: new Date().toISOString()
                    } ) );
        }

        return res.status(200).json(rows);
    }
    catch(error) {
        console.error('Error en /clients:', error.code);
        res.status(error.status).json( { error: error.message } );
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        if(!isValidUUID(id))
        {
            throw Object.assign( new Error('ID Inválido'),
                {
                    status: 400,
                    code: "INVALID_ID_FORMAT",
                    timestamp: new Date().toISOString()
                } );
        }

        const [rows] = await req.pool.query('SELECT * FROM clients WHERE id = ?', [id]);
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

        res.status(200).json(rows);
    } catch(error) {
        console.error('Error en /clients/:id:', error);
        res.status(500).json( { error: 'Error al traer el cliente por id' } );
    }
};

module.exports = { getClients, getClientById };