const {isValidUUID, validateId} = require('../../utils/validations');
const { updateProductQuery, updateProductBuilder } = require('../../utils/queryBuilder');
const createError = require('../../utils/errorBuilder');

const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        validateId(id);

        const { conditionsQuery, values } = updateProductBuilder(req.body);

        values.push(id);

        const query = `UPDATE products SET ${conditionsQuery} WHERE id = ?`;

        const [result] = await req.pool.query( query, values );

        if(result.affectedRows===0) {
            throw createError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND')
        }

        const [rows] = await req.pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if(rows.length===0) {
            throw createError('El producto desapareció durante la petición', 500, 'DATA_INCONSISTENCY_ERROR')
        }

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error("Error actualizando un producto:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const toggleProduct = async (req, res) => {
    try {
        const {id} = req.params;

        validateId(id);

        const [ result ] = await req.pool.query( 'UPDATE products SET is_active = NOT is_active WHERE id = ?', [ id ] );
        
        if(result.affectedRows===0) {
            throw createError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
        }

        return res.status(200).json( { message: 'Estado del producto actualizado' } );
    } catch(error) {
        console.error( "Error en toggleProduct:", error.code||error );
        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

module.exports = { updateProduct, toggleProduct };