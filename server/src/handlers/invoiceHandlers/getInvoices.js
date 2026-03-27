const validation = require('../../utils/validations');

const getAllInvoices = async (req, res) => {
    try {
        const [invoices] = await req.pool.query('SELECT * FROM invoices');

        return res.status(201).json( invoices );
    } catch(error) {
        console.error( "Error trayendo todos los invoices:", error.code||error );
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        validation.validateId(id);

        const query = 'invoices.id AS invoice_id, products.name AS product_name, invoices.status AS status, invoice_items.quantity AS quantity, invoice_items.unit_price AS price_at_addition FROM invoice_items JOIN invoices ON invoices.id = invoice_items.invoice_id JOIN products ON invoice_items.product_id = products.id WHERE invoice_items.invoice_id = ?'

        const [invoice] = await req.pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
        // const [invoice] = await req.pool.query(`SELECT ${query}`, [id]);
        if(invoice.length===0)
        {
            throw Object.assign( new Error('Invoice no encontrado'),
            {
                status: 404,
                code: 'INVOICE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( invoice[0] );
    } catch(error) {
        console.error( "Error trayendo invoice por ID:", error.code||error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = { getAllInvoices, getInvoiceById };