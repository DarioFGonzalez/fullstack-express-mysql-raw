const createError = require('../../utils/errorBuilder');
const validations = require('../../utils/validations');

const postInvoice = async (req, res) => {
    let connection;

    try {
        connection = await req.pool.getConnection();

        await connection.beginTransaction();

        const { product_id, quantity } = req.body;
        const { id } = req.client;

        if(!quantity || quantity<=0) {
            throw createError('La cantidad debe ser mayor que cero', 400, 'INVALID_QUANTITY');
        }

        validations.validateId(product_id);

        const [existingDraft] = await connection.query(`SELECT id FROM invoices WHERE client_id = ? AND status = "draft"`, [id]);
        if(existingDraft.length>0) {
            throw createError('El cliente ya tiene un invoice activo', 409, 'DRAFT_ALREADY_EXISTS', { details: `ID del Invoice existente: ${existingDraft[0].id}`} );
        }

        await connection.query('INSERT INTO invoices (client_id) VALUES (?)', [id]);
        const [rows] = await connection.query("SELECT id FROM invoices WHERE client_id = ? AND status = 'draft' ORDER BY created_at DESC LIMIT 1", [id]);
        if(rows.length===0) {
            throw createError('Error al recuperar la factura creada', 500, 'DATA_CONSISTENCY_ERROR');
        }

        const [productInfo] = await connection.query('SELECT unit_price, stock, reserved_stock FROM products WHERE id = ?', [product_id]);
        if(productInfo.length===0) {
            throw createError('Producto no encntrado', 404, 'PRODUCT_NOT_FOUND');
        }

        const realStock = productInfo[0].stock - productInfo[0].reserved_stock;
        if(realStock-quantity < 0) {
            throw createError('No hay suficiente stock del producto seleccionado', 409, 'INSUFFICIENT_STOCK', {
                        details: `El producto id: ${product_id} tiene stock real de ${realStock} y necesitamos ${quantity}`
                    }
            )
        }

        const subtotal = productInfo[0].unit_price * quantity;

        const [result] = await connection.query('INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
            [rows[0].id, product_id, quantity, productInfo[0].unit_price, subtotal]
        )

        if(result.affectedRows===0) {
            throw createError('Error al crear la relacional', 500, 'DATA_CONSISTENCY_ERROR');
        }

        await connection.commit();

        return res.status(201).json( {invoiceId: rows[0].id} );
    } catch(error) {
        console.error( "Error creando invoice:", error.code || error );
        if(connection) await connection.rollback()
        return res.status(error.status||500).json( {error: error.message || error} );
    } finally {
        if(connection) connection.release();
    }
}

module.exports = postInvoice;