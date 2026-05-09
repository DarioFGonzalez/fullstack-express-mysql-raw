const validation = require('../../utils/validations');
const { queryBuilder, searchClientsQuery } = require('../../utils/queryBuilder');

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
        const { queryFilters, values } = searchClientsQuery(req.query);

        const [rows] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE ${queryFilters}`, values);

        return res.status(200).json( rows );
    }
    catch(error) {
        console.error('Error trayendo clientes por query:', error.code || error);
        res.status(error.status || 500).json( { error: error.message || error } );
    }
};

const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        validation.validateId(id);

        const [rows] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [id]);
        if(rows.length===0) {
            throw createError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
        }

        const facturasQuery = `
        SELECT
        invoices.id AS invoice_id,
        invoices.status AS status,
        invoices.issue_date AS issue_date,
        invoices.total AS total
        FROM invoices WHERE invoices.client_id = ?`;
        
        const [facturas] = await req.pool.query( facturasQuery, [id])

        rows[0].invoices = facturas;

        res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error en /clients/:id:', error.code || error);
        res.status(error.status||500).json( { error: error.message || 'Error al traer el cliente por id' } );
    }
};

module.exports = { getAllClients, getClientById, getClientsByQuery };