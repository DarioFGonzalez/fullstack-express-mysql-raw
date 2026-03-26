const validations = require('../../utils/validations');

const postInvoice = async (req, res) => {
    try {
        const { clientId, productId, quantity } = req.body;

        if(quantity<=0)
        {
            throw Object.assign( new Error('La cantidad debe ser mayor que cero'),
            {
                status: 400,
                code: "INVALID_QUANTITY",
                timestamp: new Date().toISOString()
            })
        }

        validations.validateId(clientId);
        validations.validateId(productId);

        await req.pool.query('INSERT INTO invoices (client_id) VALUES (?)', [clientId]);
        const [invoiceId] = await req.pool.query("SELECT id FROM invoices WHERE client_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 1", [ clientId ]);
        if(invoiceId.length===0)
        {
            throw Object.assign( new Error('Error buscando registro'),
            {
                status: 404,
                code: 'MISSING_INVOICE',
                timestamp: new Date().toISOString()
            })
        }

        const [precio] = await req.pool.query('SELECT unit_price FROM products WHERE id = ?', [productId]);
        if(precio.length===0)
        {
            throw Object.assign( new Error('Error encontrando el precio del producto'),
            {
                status: 404,
                code: 'MISSING_PRODUCT_PRICE',
                timestamp: new Date().toISOString()
            })
        }

        const subtotal = precio[0].unit_price * quantity;

        const [result] = await req.pool.query('INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
            [invoiceId[0].id, productId, quantity, precio[0].unit_price, subtotal]
        )

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('No se creó la relacional'),
            {
                status: 400,
                code: "ERROR_CREATING_INVOICE_ITEM",
                timestamp: new Date().toISOString()
            })
        }

        return res.status(201).json( {invoiceId: invoiceId[0].id} );
    } catch(error) {
        console.error( "Error posteando invoice:", error.code || error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = postInvoice;