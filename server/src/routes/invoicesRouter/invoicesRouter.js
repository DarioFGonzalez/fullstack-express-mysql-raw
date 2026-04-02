const {Router} = require('express');
const invoicesRouter = Router();
const postInvoice = require('../../handlers/invoiceHandlers/postInvoice');
const { getAllInvoices, getInvoiceById, getInvoicesByQuery } = require('../../handlers/invoiceHandlers/getInvoices');
const { updateInvoice } = require('../../handlers/invoiceHandlers/updateInvoice');
const confirmInvoice = require('../../handlers/invoiceHandlers/confirmInvoice');
const deliverInvoice = require('../../handlers/invoiceHandlers/deliverInvoice');

invoicesRouter.post('/', postInvoice);

invoicesRouter.get('/all', getAllInvoices);
invoicesRouter.get('/search', getInvoicesByQuery);
invoicesRouter.get('/:id', getInvoiceById);

invoicesRouter.patch('/:id', updateInvoice);

invoicesRouter.post('/:id/confirm', confirmInvoice);
invoicesRouter.post('/:id/deliver', deliverInvoice);
// invoicesRouter.post('/:id/paid', paidInvoice);

// invoicesRouter.post('/:id/cancel', cancelInvoice);

module.exports = invoicesRouter;