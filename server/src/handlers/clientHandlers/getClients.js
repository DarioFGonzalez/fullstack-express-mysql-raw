const validation = require('../../utils/validations');
const { queryBuilder } = require('../../utils/queryBuilder');

const getAllClients = async (req, res) => {
    try {
        const [rows] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients`);

        return res.status(200).json(rows);
    }
    catch(error) {
        console.error('Error en clients/all:', error);
        res.status(500).json( { error: error.message  } );
    }
}

const getClientsByQuery = async (req, res) => {
    try {
        const { conditions, values } = queryBuilder(req.query);

        const whereCondition = conditions.join(' AND ');
        
        const [rows] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE ${whereCondition}`, [values]);
        return res.status(200).json( rows );
    }
    catch(error) {
        console.error('Error en /clients:', error.code || error);
        res.status(error.status || 500).json( { error: error.message || 'Error interno' } );
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        validation.validateId(id);

        const [rows] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [id]);
        if(rows.length===0)
        {
            throw Object.assign( new Error('Cliente con esa ID no encontrado en la base de datos'),
                {
                    status: 404,
                    code: "CLIENT_ID_NOT_FOUND",
                    timestamp: new Date().toISOString()
                } );
        }
        const [facturas] = await req.pool.query(`SELECT invoices.id AS invoice_id, invoices.status AS status, invoices.issue_date AS issue_date, invoices.total AS total FROM invoices WHERE invoices.client_id = ?`, [id])

        rows[0].invoices = facturas;

        res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error en /clients/:id:', error.code || error);
        res.status(error.status||500).json( { error: error.message || 'Error al traer el cliente por id' } );
    }
};

module.exports = { getAllClients, getClientById, getClientsByQuery };