const { validateId } = require("../../utils/validations");

const payInvoice = async (req, res) => {
    const { id } = req.params;
    validateId(id);

    try {
        const [invoiceStatus] = await req.pool.query('SELECT status FROM invoices WHERE id = ?', [id]);
        if(invoiceStatus.length===0)
        {
            throw Object.assign( new Error('No se encontró invoice con esa ID en DDBB'),
            {
                status: 404,
                code: "INVOICE_NOT_FOUND",
                timestamp: new Date().toISOString()
            })
        }
        const {status} = invoiceStatus[0];
        const validStatus = [ 'confirmed', 'delivered' ];
        if(!validStatus.includes(status))
        {
            throw Object.assign( new Error('Status del invoice inválido para aceptar pago'),
            {
                status: 400,
                code: 'INVALID_INVOICE_STATUS',
                timestamp: new Date().toISOString()
            })
        }

        const [result] = await req.pool.query('UPDATE invoices SET status = "paid", paid_at = CURRENT_TIMESTAMP WHERE id = ?', [ id ]);
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('No se pudo actualizar el estado del invoice'),
            {
                status: 500,
                code: "ERROR_UPDATING_STATUS",
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( {message: 'Invoice actualizado a paid', invoiceId: id} );
    } catch(error) {
        console.error( "Error actualizando invoice a 'paid': ", error.code || error );
        return res.status(error.status||500).json( {error: error.message || error} );
    }
}

module.exports = payInvoice;