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

module.exports = { queryBuilder, productQueryBuilder };