const validation = require('../../utils/validations');
const { searchProductByQuery } = require('../../utils/queryBuilder');

const getAllproducts = async (req, res) => {
    try {
        const [rows] = await req.pool.query('SELECT * FROM products');

        return res.status(200).json( rows );
    } catch(error) {
        console.error( 'Error en products/all:', error );
        return res.status(500).json( { error: error.message } );
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id)
        {
            throw Object.assign( new Error('Falta ID'),
            {
                status: 400,
                code: 'MISSING_ID',
                timestamp: new Date().toISOString()
            })
        }
        if(!validation.isValidUUID(id))
        {
            throw Object.assign( new Error('Formato del ID inválido'),
            {
                status: 400,
                code: 'INVALID_ID_FORMAT',
                timestamp: new Date().toISOString()
            })
        }

        const [rows] = await req.pool.query('SELECT * FROM products WHERE id = ?', [id]);

        if(rows.length===0)
        {
            throw Object.assign( new Error('Producto con ese ID no encontrado'),
            {
                status: 404,
                code: "PRODUCT_NOT_FOUND",
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( rows[0] );
    } catch(error) {
        console.error( "Error en /products/:id:", error );
        return res.status(error.status||500).json( { error: error.code || error } );
    }
}

const getProductsByQuery = async (req, res) => {
    try {
        const { conditions, values } = searchProductByQuery(req.query);
        if(!conditions)
        {
            throw Object.assign( new Error('No se encontraron parametros'),
            {
                status: 400,
                code: "MISSING_SEARCHING_PARAMETERS",
                timestamp: new Date().toISOString()
            })
        }

        const query = `SELECT * FROM products WHERE ${conditions.join(' AND ')}`;
        
        const [ rows ] = await req.pool.query(query, values);

        return res.status(200).json( rows );
    } catch(error) {
        console.error("Error en /products/search?query:", error);
        return res.status(error.status||500).json( { error: error.code||error } );
    }
}

module.exports = { getAllproducts, getProductById, getProductsByQuery };