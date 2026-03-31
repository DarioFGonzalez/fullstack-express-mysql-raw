const { validateId, isValidUUID } = require("./validations");

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

const invoiceByQueryBuilder =(queries) =>
{
    const { issue_date_from, issue_date_to, due_date_from, due_date_to, total_from, total_to, paid_at_from, paid_at_to } = queries;
    const { client_id, status, invoice_number, payment_terms } = queries;

    const conditions = [];
    const values = [];

    if(issue_date_from && issue_date_to)
    {
        conditions.push('issue_date BETWEEN ? AND ?');
        values.push(issue_date_from, issue_date_to);        
    }
    else
    {
        if(issue_date_from)
        {
            conditions.push(`issue_date >= ?`);
            values.push(issue_date_from);
        }
        if(issue_date_to)
        {
            conditions.push('issue_date <= ?');
            values.push(issue_date_to);
        }
    }

    if(due_date_from && due_date_to)
    {
        conditions.push('due_date BETWEEN ? AND ?');
        values.push(due_date_from, due_date_to);
    }
    else
    {
        if(due_date_from)
        {
            conditions.push('due_date >= ?');
            values.push(due_date_from);
        }
        if(due_date_to)
        {
            conditions.push('due_date <= ?');
            values.push(due_date_to);
        }
    }

    if(total_from && total_to)
    {
        conditions.push('total BETWEEN ? AND ?');
        values.push(total_from, total_to);
    }
    else
    {
        if(total_from)
        {
            conditions.push('total >= ?');
            values.push(total_from);
        }
        if(total_to)
        {
            conditions.push('total <= ?');
            values.push(total_to);
        }
    }

    if(paid_at_from && paid_at_to)
    {
        conditions.push('paid_at BETWEEN ? AND ?');
        values.push(paid_at_from, paid_at_to);
    }
    else
    {
        if(paid_at_from)
        {
            conditions.push('paid_at >= ?');
            values.push(paid_at_from);
        }
        if(paid_at_to)
        {
            conditions.push('paid_at <= ?');
            values.push(paid_at_to);
        }
    }

    if(client_id)
    {
        if(isValidUUID(client_id))
        {
            conditions.push('client_id = ?');
            values.push(client_id);
        }
        else
        {
            throw Object.assign( new Error('Formato del ID recibido por query inválido'),
            {
                status: 400,
                code: 'INVALID_ID_FORMAT',
                timestamp: new Date().toISOString()
            })
        }
    }

    const allowedStatus = [ 'draft', 'confirmed', 'delivered', 'paid', 'cancelled' ];

    if(status)
    {
        if(allowedStatus.includes(status))
        {
            conditions.push('status = ?');
            values.push(status)
        }
        else
        {
            throw Object.assign( new Error(`STATUS inválido, valores permitidos: ${allowedStatus.join(', ')}`),
            {
                status: 400,
                code: 'INVALID_STATUS',
                timestamp: new Date().toISOString()
            })
        }
    }

    const allowedPaymentTerms = [ '30', '60', '90', '120' ];

    if(payment_terms)
    {
        if(allowedPaymentTerms.includes(payment_terms))
        {
            conditions.push('payment_terms = ?');
            values.push(payment_terms);
        }
        else
        {
            throw Object.assign( new Error(`Término de pago inválido, valores válidos: ${allowedPaymentTerms.join(', ')}`),
            {
                status: 400,
                code: 'INVALID_PAYMENT_TERMS',
                timestamp: new Date().toISOString()
            })
        }
    }

    if(invoice_number)
    {
        conditions.push('invoice_number LIKE ?');
        values.push(`%${invoice_number}%`);
    }

    if(conditions.length===0)
    {
        throw Object.assign( new Error('No se recibieron parámetros de búsqueda válidos'),
        {
            status: 400,
            code: 'MISSING_SEARCH_PARAMETERS',
            timestamp: new Date().toISOString()
        })
    }

    const whereClause = conditions.join(' AND ');

    return { whereClause, values };
}

module.exports = { queryBuilder,
    productQueryBuilder, searchProductByQuery, updateProductQuery,
    invoiceByQueryBuilder };