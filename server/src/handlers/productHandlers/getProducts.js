const validation = require('../../utils/validations');
const { searchProductByQuery, searchProductQuery } = require('../../utils/queryBuilder');

const getAllproducts = async (req, res) => {
    try {
        const [rows] = await req.pool.query(`SELECT ${validation.productFields} FROM products`);

        return res.status(200).json( rows );
    } catch(error) {
        console.error( 'Error trayendo todos los productos:', error.code||error );
        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        validation.validateId(id);

        const [rows] = await req.pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if(rows.length===0) {
            throw createError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
        }

        return res.status(200).json( rows[0] );
    } catch(error) {
        console.error( "Error en /products/:id:", error );
        return res.status(error.status||500).json( { error: error.code || error } );
    }
}

const getProductsByQuery = async (req, res) => {
    try {
        const { queryFilters, values} = searchProductQuery(req.query);

        const searchQuery = `SELECT ${validation.productFields} FROM products WHERE ${queryFilters}`;
        
        const [ rows ] = await req.pool.query(searchQuery, values);

        return res.status(200).json( rows );
    } catch(error) {
        console.error("Error buscando productos por query:", error.code || error);
        
        return res.status(error.status||500).json( { error: error.message||error } );
    }
}

module.exports = { getAllproducts, getProductById, getProductsByQuery };