const getInvoiceWithItems = async (pool, id) => {
    const getInvoiceByIdQuery = 'SELECT * FROM invoices WHERE id = ?';

    const [invoice] = await pool.query(getInvoiceByIdQuery, [id]);
    if(invoice.length===0)
    {
        throw Object.assign( new Error('Invoice no encontrado'),
        {
            status: 404,
            code: 'INVOICE_NOT_FOUND',
            timestamp: new Date().toISOString()
        })
    }

    const getProductsRelatedToInvoice =
    `SELECT
    products.id AS product_id,
    products.name AS product_name,
    invoice_items.unit_price AS price_at_addition,
    invoice_items.quantity AS quantity,
    invoice_items.subtotal AS subtotal
    FROM invoices
    JOIN invoice_items ON invoice_items.invoice_id = invoices.id
    JOIN products ON invoice_items.product_id = products.id
    WHERE invoices.id = ?`;
    
    const [productsRelated] = await pool.query( getProductsRelatedToInvoice, id );
    
    invoice[0].products = productsRelated;

    return invoice[0];
}

module.exports = { getInvoiceWithItems };