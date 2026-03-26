const {isValidUUID} = require('../../utils/validations');
const { updateProductQuery } = require('../../utils/queryBuilder');

const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id)
        {
            throw Object.assign( new Error('ID no recibido'),
            {
                status: 400,
                code: "NO_ID_RECEIVED",
                timestamp: new Date().toISOString()
            })
        }
        if(!isValidUUID(id))
        {
            throw Object.assign( new Error('Formato del ID inválido'),
            {
                status:400,
                code: "INVALID_ID_FORMAT",
                timestamp: new Date().toISOString()
            })
        }

        const { conditions, values } = updateProductQuery(req.body);
        
        if(conditions.length===0)
        {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        values.push(id);

        const query = `UPDATE products SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query( query, values );

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Producto no encontrado'),
            {
                status: 404,
                code: 'PRODUCT_NOT_FOUND',
                timestamp: new Date().toISOString()
            } );
        }

        const [rows] = await req.pool.query('SELECT * FROM products WHERE id = ?', [id]);

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error("Error en update/:id:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const toggleProduct = async (req, res) => {
    try {
        const {id} = req.params;

        if(!id)
        {
            throw Object.assign( new Error('ID no recibido'),
            {
                status: 400,
                code: "NO_ID_RECEIVED",
                timestamp: new Date().toISOString()
            })
        }
        if(!isValidUUID(id))
        {
            throw Object.assign( new Error('Formato del ID inválido'),
            {
                status:400,
                code: "INVALID_ID_FORMAT",
                timestamp: new Date().toISOString()
            })
        }

        const [ result ] = await req.pool.query( 'UPDATE products SET is_active = NOT is_active WHERE id = ?', [ id ] );
        
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Producto no encontrado'),
            {
                status: 404,
                code: 'PRODUCT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( { message: 'Estado del producto actualizado' } );
    } catch(error) {
        console.error( "Error en toggleProduct:", error.code||error );
        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

module.exports = { updateProduct, toggleProduct };