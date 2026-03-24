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

module.exports = queryBuilder;