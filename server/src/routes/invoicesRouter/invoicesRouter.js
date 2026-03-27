const {Router} = require('express');
const invoicesRouter = Router();
const postInvoice = require('../../handlers/invoiceHandlers/postInvoice');
const { getAllInvoices, getInvoiceById } = require('../../handlers/invoiceHandlers/getInvoices');
const { updateInvoice } = require('../../handlers/invoiceHandlers/updateInvoice');

invoicesRouter.post('/', postInvoice);

invoicesRouter.get('/all', getAllInvoices);
// invoicesRouter.get('/search', getInvoiceByQuery);
invoicesRouter.get('/:id', getInvoiceById);

invoicesRouter.patch('/:id', updateInvoice);

// invoicesRouter.patch('/:id/toggle-active', toggleInvoice);

module.exports = invoicesRouter;