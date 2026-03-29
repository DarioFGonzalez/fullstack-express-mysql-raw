const validation = require('../../utils/validations');
const {invoiceUpdateQueryBuilder} = require('../../utils/queryBuilder');

const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        validation.validateId(id);

        const { product_id, quantity } = req.body;
        if(!product_id || !quantity)
        {
            throw Object.assign( new Error('Faltan datos necesarios para la relación'),
            {
                status: 400,
                code: 'MISSING_RELATION_DATA',
                timestamp: new Date().toISOString()
            })
        }
        validation.validateId(id);

        const findProductByIdQuery = 'SELECT products.unit_price, products.stock, products.reserved_stock FROM products WHERE products.id = ?';
        const [product] = await req.pool.query(findProductByIdQuery, [product_id]);

        if(product.length===0)
        {
            throw Object.assign( new Error('Producto no encontrado'),
            {
                status: 404,
                code: 'PRODUCT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const { unit_price, stock, reserved_stock } = product[0];
        
        const findExistingRelationQuery = 'SELECT * FROM invoice_items WHERE invoice_items.product_id = ? AND invoice_items.invoice_id = ?';
        const [existingRelation] = await req.pool.query(findExistingRelationQuery, [product_id, id]);

        console.log( "unit_price: ", unit_price, "\nstock: ", stock, "\nreserved_stock: ", reserved_stock);

        if(reserved_stock + quantity > stock)
        {
            throw Object.assign( new Error('Insuficiente stock para agregar al carrito'),
            {
                status: 409,
                code: "INSUFFICIENT_STOCK",
                timestamp: new Date().toISOString()
            })
        }

        const subtotal = unit_price * quantity;
        if(existingRelation.length===0)
        {
            console.log();            
            return res.status(200).json( {message: "Relación inexistente, crear" });
        }

        return res.status(200).json({ message: "Relación existente, modificar" });

        //actualizar la que ya existe usando existingRelation.quantity+=quantity;
        return res.status(200).json(existingRelation)
    } catch(error) {
        console.error( "Error actualizando invoice:", error.code||error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = { updateInvoice };