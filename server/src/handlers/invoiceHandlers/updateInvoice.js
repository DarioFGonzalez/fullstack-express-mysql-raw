const validation = require('../../utils/validations');

const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        validation.validateId(id);

        const [thisInvoice] = await req.pool.query('SELECT status FROM invoices WHERE id = ?', [ id ]);
        if(thisInvoice.length===0)
        {
            throw Object.assign( new Error('Invoice inexistente'),
            {
                status: 404,
                code: 'INVOICE_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        if(thisInvoice[0].status!=='draft') {
            throw Object.assign( new Error('Solo invoices en estado "draft" pueden ser modificados'),
            {
                status: 400,
                code: "ONLY_DRAFT_INVOICES_CAN_BE_MODIFIED",
                timestamp: new Date().toISOString()
            })
        }

        const productIds = [];

        const productsBatch = req.body;
        productsBatch.forEach( ( productInfo ) => {
            if(productInfo.quantity==undefined || !productInfo.product_id)
            {
                throw Object.assign( new Error('Faltan datos necesarios para la relación'),
                {
                    status: 400,
                    code: 'MISSING_RELATION_DATA',
                    timestamp: new Date().toISOString()
                })
            }
            validation.validateId(productInfo.product_id);
            productIds.push(productInfo.product_id);
        })

        const placeHolders = productIds.map( () => '?' ).join(', ');

        const findProductsByIdQuery = `SELECT products.id AS product_id, products.unit_price, products.stock, products.reserved_stock FROM products WHERE products.id IN (${placeHolders})`;

        const [allProductsInfo] = await req.pool.query( findProductsByIdQuery, productIds );
        if(allProductsInfo.length!==productIds.length)
        {
            throw Object.assign( new Error('Error trayendo información de productos'),
            {
                status: 400,
                code: "ERROR_FETCHING_PRODUCTS_INFO",
                timestamp: new Date().toISOString()
            })
        }

        const finalValues = [];
        const finalPlaceholders = [];

        const toDestroyValues = [];
        const toDestroyPlaceholders = [];

        productsBatch.forEach( (pInfo) => {
            const fetchedProductInfo = allProductsInfo.find( (x) => x.product_id === pInfo.product_id );
            if(!fetchedProductInfo)
            {
                throw Object.assign( new Error(`Error trayendo información sobre el producto id ${pInfo.product_id}`),
                {
                    status: 400,
                    code: "ERROR_FETCHING_PRODUCT_INFO",
                    timestamp: new Date().toISOString()
                })
            }
            if(pInfo.quantity<=0)
            {
                toDestroyValues.push(pInfo.product_id);
                toDestroyPlaceholders.push('?');
            }
            else
            {
                if(fetchedProductInfo.reserved_stock + pInfo.quantity <= fetchedProductInfo.stock)
                {
                    finalValues.push(id, pInfo.product_id, pInfo.quantity, fetchedProductInfo.unit_price, pInfo.quantity * fetchedProductInfo.unit_price )
                    finalPlaceholders.push( '(?, ?, ?, ?, ?)' );
                }
                else
                {
                    throw Object.assign( new Error(`Stock insuficiente en producto ID ${pInfo.product_id}`),
                    {
                        status: 400,
                        code: "INSUFFICIENT_STOCK",
                        timestamp: new Date().toISOString()
                    })
                }
            }
        })

        if(toDestroyValues.length!==0)
        {
            const destroyBatchQuery =
            `DELETE
            FROM invoice_items
            WHERE invoice_id = ?
            AND product_id IN (${toDestroyPlaceholders.join(', ')})`;

            await req.pool.query(destroyBatchQuery, [id, ...toDestroyValues]);
        }

        if(finalPlaceholders.length > 0)
        {
            const insertOrUpdateBatchQuery = `INSERT INTO invoice_items
                (invoice_id, product_id, quantity, unit_price, subtotal)
                VALUES ${finalPlaceholders.join(', ')}
                ON DUPLICATE KEY UPDATE
                    quantity = VALUES(quantity),
                    subtotal = VALUES(subtotal),
                    updated_at = CURRENT_TIMESTAMP`;
            
            await req.pool.query( insertOrUpdateBatchQuery, finalValues );
        }

        return res.status(200).json( { message: 'Invoice actualizado' } );
    } catch(error) {
        console.error( "Error actualizando muchos invoice:", error.code||error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = { updateInvoice };