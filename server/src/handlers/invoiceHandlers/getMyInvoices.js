const createError = require("../../utils/errorBuilder");
const { getInvoiceWithItems } = require("../../utils/invoiceUtils");
const validation = require('../../utils/validations');

const getMyInvoices = async (req, res) => {
    const { id } = req.client;

    const invoiceFields = 'id, status, total, created_at, issue_date, due_date, delivered_at, paid_at';

    try {
        const [clientInvoices] = await req.pool.query(`SELECT ${invoiceFields} FROM invoices WHERE client_id = ?`, [id]);
        
        return res.status(200).json(clientInvoices);
    } catch(error) {
        console.error("Error trayendo invoices del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getThisInvoice = async (req, res) => {
    const { id } = req.client;
    const { invoiceId } = req.params;

    validation.validateId(invoiceId);

    const invoiceFields = 'id, client_id';

    try {
        const [response] = await req.pool.query(`SELECT ${invoiceFields} FROM invoices WHERE id = ?`, [invoiceId]);
        if(response.length===0) {
            throw createError('Invoice no encontrado', 404, 'INVOICE_NOT_FOUND');
        }
        if(response[0].client_id!==id) {
            throw createError('Este invoice no le pertenece', 403, 'FORBIDDEN');
        }

        const invoiceById = await getInvoiceWithItems(req.pool, response[0].id);

        return res.status(200).json(invoiceById);
    } catch(error) {
        console.error("Error trayendo invoice por id:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const getMyActiveInvoice = async (req, res) => {
    const { id } = req.client;

    try {
        const [response] = await req.pool.query(`SELECT id FROM invoices WHERE client_id = ? AND status = "draft"`, [id]);
        if(response.length===0)  return res.status(200).json( response );

        const activeInvoice = await getInvoiceWithItems(req.pool, response[0].id);

        return res.status(200).json(activeInvoice);
    } catch(error) {
        console.error("Error trayendo invoice activo del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = { getMyInvoices, getThisInvoice, getMyActiveInvoice };