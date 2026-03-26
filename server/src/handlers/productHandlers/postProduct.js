const { productQueryBuilder } = require('../../utils/queryBuilder');

const postProduct = async (req, res) => {
    try {
        const { columns, values } = productQueryBuilder(req.body);
        if(!columns)
        {
            throw Object.assign( new Error('Faltan datos necesarios'),
            {
                status: 400,
                code: "MISSING_KEY_INFORMATION",
                timestamp: new Date().toISOString()
            })
        }

        const columnList = columns.join(', ');
        const placeHolders = columns.map( () => '?').join(', ');

        const insertQuery = `INSERT INTO products (${columnList}) VALUES (${placeHolders})`;

        await req.pool.query(insertQuery, values);

        const [rows] = await req.pool.query('SELECT * FROM products WHERE sku = ?', [ req.body.sku ] );
        if(rows.length===0)
        {
            throw Object.assign( new Error('Error buscando registro'),
            {
                status: 404,
                code: 'MISSING_PRODUCT',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(201).json( rows[0] );
    } catch(error) {
        console.error( 'Error al postear el producto: ', error.code || error );

        if(error.code==='ER_DUP_ENTRY') return res.status(409).json( { error: 'El producto ya existe' } );

        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

module.exports = postProduct;