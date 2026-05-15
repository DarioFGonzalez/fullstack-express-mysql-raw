const createError = require('../../utils/errorBuilder');
const { getInvoiceWithItems } = require('../../utils/invoiceUtils');
const { validateId } = require('../../utils/validations');

const cancelInvoice = async (req, res) => {
    const { id } = req.params;
    validateId(id);

    let connection;
    
    try {
        connection = await req.pool.getConnection();
        
        await connection.beginTransaction();

        const caseConditions = [];

        const values = [];

        const ids = [];

        const invoice = await getInvoiceWithItems(connection, id);

        if(invoice.status!=='confirmed')  {
            throw createError('Solo se puede cancelar invoices confirmados', 400, 'CANNOT_CANCEL_AN_UNCONFIRMED_INVOICE');
        }

        invoice.products.forEach( (invoice_item) => {
            const newReservedStock = invoice_item.reserved_stock - invoice_item.quantity;

            if(newReservedStock >=0)
            {
                caseConditions.push('WHEN id = ? THEN  ?');

                values.push(invoice_item.product_id, newReservedStock);
                
                ids.push(invoice_item.product_id);
            }
            else
            {
                throw createError(`Error con reserved_stock en producto ID: ${invoice_item.product_id}`, 409, 'INCONSISTENT_RESERVED_STOCK');
            }
        })

        const batchUpdateQuery =
        `UPDATE products
        SET
            reserved_stock = CASE
            ${caseConditions.join(' ')}
            ELSE reserved_stock
        END
        WHERE id IN (${ids.map( () => '?' ).join(', ')})`

        await connection.query(batchUpdateQuery, [...values, ...ids ]);

        const updateInvoiceQuery =
        `UPDATE invoices
        SET status = 'cancelled'
        WHERE id = ?`;

        const [result] = await connection.query(updateInvoiceQuery, [ id ]);
        if(result.affectedRows===0) {
            throw createError('No se actualizó el invoice en el paso final', 500, 'DATA_INCONSISTENCY_ERROR');
        }

        await connection.commit();

        return res.status(200).json( {message: 'Invoice cancelado', invoice_id: id } );
    } catch(error) {
        await connection.rollback();
        console.error( "Error cancelando invoice:", error.code || error );
        return res.status(error.status||500).json( {error: error.message || error} );
    } finally {
        connection.release();
    }    
}

module.exports = cancelInvoice;