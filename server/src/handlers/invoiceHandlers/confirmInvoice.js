const { getInvoiceWithItems, generateInvoiceNumber } = require('../../utils/invoiceUtils');
const { validateId, validatePaymentTerms } = require('../../utils/validations');

const confirmInvoice = async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const { payment_terms, notes } = req.body;
    validatePaymentTerms(payment_terms);

    const connection = await req.pool.getConnection();

    try {
        await connection.beginTransaction();

        const caseConditions = [];
        const values = [];
        const ids = [];

        let total = 0;

        const invoice = await getInvoiceWithItems(connection, id);

        invoice.products.forEach( (invoice_item) => {
            const newReservedStock = invoice_item.reserved_stock + invoice_item.quantity;
            if(newReservedStock <= invoice_item.stock)
            {
                caseConditions.push('WHEN id = ? THEN  ?');
                values.push(invoice_item.product_id, newReservedStock);
                ids.push(invoice_item.product_id);

                const subtotal = invoice_item.price_at_addition * invoice_item.quantity;
                total+=subtotal;
            }
            else
            {
                throw Object.assign( new Error(`Sin stock suficiente en product ID: ${invoice_item.product_id}`))
            }
        })

        const batchUpdateQuery =
        `UPDATE products
        SET reserved_stock = CASE
            ${caseConditions.join(' ')}
            ELSE reserved_stock
        END
        WHERE id IN (${ids.map( () => '?' ).join(', ')})`

        values.push( ...ids );

        await connection.query(batchUpdateQuery, values);

        const invoice_number = generateInvoiceNumber();

        const updateInvoiceQuery =
        `UPDATE invoices
        SET status = 'confirmed',
            invoice_number = ?,
            issue_date = CURDATE(),
            due_date = DATE_ADD(CURDATE(), INTERVAL ? DAY),
            payment_terms = ?,
            total = ?,
            notes = ?
        WHERE id = ?`;

        const [result] = await connection.query(updateInvoiceQuery, [ invoice_number, parseInt(payment_terms, 10), payment_terms, total, notes, id ]);
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('No se actualizó el invoice en el paso final'),
            {
                status: 500,
                code: 'COULDNT_UPDATE_INVOICE',
                timestamp: new Date().toISOString()
            })
        }

        await connection.commit();

        return res.status(200).json( {message: 'Invoice confirmado', invoice_id: id, invoice_number} );
    } catch(error) {
        await connection.rollback();
        console.error( "Error confirmando invoice:", error.code || error );
        return res.status(error.status||500).json( {error: error.message || error} );
    } finally {
        connection.release();
    }    
}

module.exports = confirmInvoice;