const { getInvoiceWithItems } = require("../../utils/invoiceUtils");
const validation = require("../../utils/validations");

const getMyProfile = async (req, res) => {
    const { id } = req.client;
    validation.validateId(id);

    try {
        const [userInfo] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [id]);
        if(userInfo.length === 0) {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json(userInfo[0]);
    } catch(error) {
        console.error("Error trayendo perfíl del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getMyInvoices = async (req, res) => {
    const { id } = req.client;
    validation.validateId(id);

    const invoiceFields = 'id, status, total, created_at, issue_date, due_date, delivered_at, paid_at';

    try {
        const [clientInvoices] = await req.pool.query(`SELECT ${invoiceFields} FROM invoices WHERE client_id = ?`, [id]);
        
        return res.status(200).json(clientInvoices);
    } catch(error) {
        console.error("Error trayendo invoices del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getMyActiveInvoice = async (req, res) => {
    const { id } = req.client;
    validation.validateId(id);

    const invoiceFields = 'id, status, total, created_at, issue_date, due_date, delivered_at, paid_at';

    try {
        const [response] = await req.pool.query(`SELECT ${invoiceFields} FROM invoices WHERE client_id = ? AND status = "draft"`, [id]);
        if(response.length===0) return res.status(200).json( response );

        const activeInvoice = await getInvoiceWithItems(req.pool, response[0].id);

        return res.status(200).json(activeInvoice);
    } catch(error) {
        console.error("Error trayendo invoice activo del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = { getMyProfile, getMyInvoices, getMyActiveInvoice };