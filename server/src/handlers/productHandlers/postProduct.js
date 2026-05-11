const createError = require('../../utils/errorBuilder');
const { postProductQueryBuilder } = require('../../utils/queryBuilder');
const { productFields } = require('../../utils/validations');

const postProduct = async (req, res) => {
    try {
        const { columnsQuery, placeholders, values } = postProductQueryBuilder(req.body);

        const insertQuery = `INSERT INTO products (${columnsQuery}) VALUES (${placeholders})`;

        const [result] = await req.pool.query(insertQuery, values);
        if(result.affectedRows===0) {
            throw createError('No se pudo crear el registro de producto', 500, 'DATA_CONSISTENCY_ERROR')
        }
        
        const [rows] = await req.pool.query(`SELECT ${productFields} FROM products WHERE sku = ?`, [ req.body.sku ] );
        if(rows.length===0) {
            throw createError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
        }

        return res.status(201).json( rows[0] );
    } catch(error) {
        console.error( 'Error al postear el producto: ', error.code || error );

        if(error.code==='ER_DUP_ENTRY') return res.status(409).json( { error: 'El producto ya existe' } );

        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

module.exports = postProduct;