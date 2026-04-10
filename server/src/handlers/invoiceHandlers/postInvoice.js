const validations = require('../../utils/validations');

const postInvoice = async (req, res) => {
    let connection;

    try {
        connection = await req.pool.getConnection();

        await connection.beginTransaction();

        const { productId, quantity } = req.body;
        const { id } = req.client;

        if(quantity<=0)
        {
            throw Object.assign( new Error('La cantidad debe ser mayor que cero'),
            {
                status: 400,
                code: "INVALID_QUANTITY",
                timestamp: new Date().toISOString()
            })
        }

        validations.validateId(productId);

        const [existingDraft] = await connection.query(`SELECT id FROM invoices WHERE client_id = ? AND status = "draft"`, [id]);
        if(existingDraft.length>0) {
            throw Object.assign( new Error('El cliente ya tiene un invoice activo'),
            {
                status: 409,
                code: "DRAFT_ALREADY_EXISTS",
                timestamp: new Date().toISOString(),
                details: { existingDraftId: existingDraft[0].id }
            })
        }

        await connection.query('INSERT INTO invoices (client_id) VALUES (?)', [id]);
        const [rows] = await connection.query("SELECT id FROM invoices WHERE client_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 1", [id]);
        if(rows.length===0)
        {
            throw Object.assign( new Error('Error buscando registro'),
            {
                status: 404,
                code: 'MISSING_INVOICE',
                timestamp: new Date().toISOString()
            })
        }

        const [productInfo] = await connection.query('SELECT unit_price, stock, reserved_stock FROM products WHERE id = ?', [productId]);
        if(productInfo.length===0)
        {
            throw Object.assign( new Error('Error encontrando el precio del producto'),
            {
                status: 404,
                code: 'MISSING_PRODUCT_PRICE',
                timestamp: new Date().toISOString()
            })
        }

        const realStock = productInfo[0].stock - productInfo[0].reserved_stock;
        if(realStock-quantity < 0) {
            throw Object.assign( new Error('No hay suficiente stock del producto seleccionado'),
            {
                status: 409,
                code: "INSUFFICIENT_STOCK",
                timestamp: new Date().toISOString(),
                details: {
                    productId,
                    requestedQuantity: quantity,
                    availableStock: realStock
                }
            })
        }

        const subtotal = productInfo[0].unit_price * quantity;

        const [result] = await connection.query('INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
            [rows[0].id, productId, quantity, productInfo[0].unit_price, subtotal]
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

        await connection.commit();

        return res.status(201).json( {invoiceId: rows[0].id} );
    } catch(error) {
        console.error( "Error posteando invoice:", error.code || error );
        if(connection) await connection.rollback()
        return res.status(error.status||500).json( {error: error.message || error} );
    } finally {
        if(connection) connection.release();
    }
}

module.exports = postInvoice;