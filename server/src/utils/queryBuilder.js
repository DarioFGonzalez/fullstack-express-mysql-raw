const queryBuilder = (queries) => {
    const allowedColumns = ['phone', 'address', 'contact_name', 'contact_phone', 'business_name'];

    const conditions = [];
    const values = [];

    for( const [key, value] of Object.entries(queries) ) {
        if(allowedColumns.includes(key)) {
            conditions.push(`${key} = ?`);
            values.push(value);
        }
    }

    return { conditions, values };
}

const productQueryBuilder = (queries) => {
    const allowedColumns = [
        'sku', 'name', 'description', 'category', 'unit_price', 'stock', 'reserved_stock', 'is_active'
    ];

    const columns = [];
    const values = [];

    for( const [key, value] of Object.entries(queries) ) {
        if(allowedColumns.includes(key)) {
            columns.push(key);
            values.push(value);
        }
    }

    return { columns, values };
}

const searchProductByQuery = (queries) =>
{
    const allowedColumns = [
    'sku', 'name', 'description', 'category', 'unit_price', 'stock', 'reserved_stock', 'is_active'
    ];

    const conditions = [];
    const values = [];

    for( const [key, value] of Object.entries(queries) ) {
        if(allowedColumns.includes(key)) {
            if(key==='sku')
            {
                conditions.push(`${key} = ?`)
                values.push(value)
            }
            else
            {
                conditions.push(`${key} LIKE ?`);
                values.push(`%${value}%`);
            }
        }
    }

    return { conditions, values }
}

const updateProductQuery = (queries) =>
{
    const allowedColumns = [ 'name', 'description', 'unit_price', 'stock', 'reserved_stock' ];

    const conditions = [];
    const values = [];

    for( const [key, value] of Object.entries(queries) ) {
        if(allowedColumns.includes(key)) {
            conditions.push(`${key} = ?`)
            values.push(value)
        }
    }

    return { conditions, values }
}

module.exports = { queryBuilder,
    productQueryBuilder, searchProductByQuery, updateProductQuery };