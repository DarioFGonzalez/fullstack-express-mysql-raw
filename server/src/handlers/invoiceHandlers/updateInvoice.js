const validation = require('../../utils/validations');
const {invoiceUpdateQueryBuilder} = require('../../utils/queryBuilder');

const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        validation.validateId(id);

        const { columns, values } = invoiceUpdateQueryBuilder(req.body);
        if(columns.length===0)
        {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        values.push(id);

        const query = `UPDATE invoices SET ${columns.join(', ')} WHERE id = ?`

        const [result] = await req.pool.query(query, values);

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Invoice no encontrado'),
            {
                status: 404,
                code: 'INVOICE_NOT_FOUND',
                timestamp: new Date().toISOString()
            } );
        }

        const [updatedInvoice] = await req.pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
        
        return res.status(200).json(updatedInvoice[0]);
    } catch(error) {
        console.error( "Error actualizando invoice:", error.code||error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = { updateInvoice };