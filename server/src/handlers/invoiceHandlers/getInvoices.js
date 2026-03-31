const { invoiceByQueryBuilder } = require('../../utils/queryBuilder');
const validation = require('../../utils/validations');

const getAllInvoices = async (req, res) => {
    try {
        const [invoices] = await req.pool.query('SELECT * FROM invoices');

        return res.status(200).json( invoices );
    } catch(error) {
        console.error( "Error trayendo todos los invoices:", error.code||error );
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        validation.validateId(id);

        const getInvoiceByIdQuery = 'SELECT * FROM invoices WHERE id = ?';

        const [invoice] = await req.pool.query(getInvoiceByIdQuery, [id]);
        if(invoice.length===0)
        {
            throw Object.assign( new Error('Invoice no encontrado'),
            {
                status: 404,
                code: 'INVOICE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const getProductsRelatedToInvoice =
        `SELECT
        products.id AS product_id,
        products.name AS product_name,
        invoice_items.unit_price AS price_at_addition,
        invoice_items.quantity AS quantity,
        invoice_items.subtotal AS subtotal
        FROM invoices
        JOIN invoice_items ON invoice_items.invoice_id = invoices.id
        JOIN products ON invoice_items.product_id = products.id
        WHERE invoices.id = ?`;
        
        const [productsRelated] = await req.pool.query( getProductsRelatedToInvoice, id );
        
        invoice[0].products = productsRelated;

        return res.status(200).json( invoice[0] );
    } catch(error) {
        console.error( "Error trayendo invoice por ID:", error.code||error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

const getInvoicesByQuery = async (req, res) => {
    try {
        const { whereClause, values } = invoiceByQueryBuilder(req.query);
        
        const [rows] = await req.pool.query(`SELECT * FROM invoices WHERE ${whereClause}`, values);
        return res.status(200).json( rows );
    }
    catch(error) {
        console.error('Error en /clients:', error.code || error);
        res.status(error.status || 500).json( { error: error.message || 'Error interno' } );
    }
};

module.exports = { getAllInvoices, getInvoiceById, getInvoicesByQuery };