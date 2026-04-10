const { getInvoiceWithItems } = require('../../utils/invoiceUtils');
const { validateId } = require('../../utils/validations');

const deliverInvoice = async (req, res) => {
    const { id } = req.params;
    validateId(id);
    let connection;
    
    try {
        connection = await req.pool.getConnection();
        
        await connection.beginTransaction();

        const caseConditions = [];

        const stockValues = [];
        const reservedStockValues = [];

        const ids = [];

        const invoice = await getInvoiceWithItems(connection, id);

        if(invoice.status!=='confirmed')
        {
            throw Object.assign( new Error('Invoice no previamente confirmado'),
            {
                status: 400,
                code: 'CANNOT_DELIVER_AN_UNCONFIRMED_INVOICE',
                timestamp: new Date().toISOString()
            })
        }

        invoice.products.forEach( (invoice_item) => {
            const newStock = invoice_item.stock - invoice_item.quantity;
            const newReservedStock = invoice_item.reserved_stock - invoice_item.quantity;

            if(newStock >= 0 && newReservedStock >=0)
            {
                caseConditions.push('WHEN id = ? THEN  ?');

                stockValues.push(invoice_item.product_id, newStock);
                reservedStockValues.push(invoice_item.product_id, newReservedStock);
                
                ids.push(invoice_item.product_id);
            }
            else
            {
                throw Object.assign( new Error(`Error con stock||reserved_stock en producto ID: ${invoice_item.product_id}`),
                {
                    status: 409,
                    code: 'ERROR_CALCULATING_STOCK',
                    timestamp: new Date().toISOString()
                })
            }
        })

        const batchUpdateQuery =
        `UPDATE products
        SET
            reserved_stock = CASE
            ${caseConditions.join(' ')}
            ELSE reserved_stock
        END,
            stock = CASE
            ${caseConditions.join(' ')}
            ELSE stock
        END
        WHERE id IN (${ids.map( () => '?' ).join(', ')})`

        await connection.query(batchUpdateQuery, [...reservedStockValues, ...stockValues, ...ids ]);

        const updateInvoiceQuery =
        `UPDATE invoices
        SET status = 'delivered',
            delivered_at = CURRENT_TIMESTAMP
        WHERE id = ?`;

        const [result] = await connection.query(updateInvoiceQuery, [ id ]);
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

        return res.status(200).json( {message: 'Invoice entregado', invoice_id: id } );
    } catch(error) {
        if(connection) await connection.rollback();
        console.error( "Error entregando invoice:", error.code || error );
        return res.status(error.status||500).json( {error: error.message || error} );
    } finally {
        if(connection) connection.release();
    }    
}

module.exports = deliverInvoice;