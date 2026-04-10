const {Router} = require('express');
const invoicesRouter = Router();
const postInvoice = require('../../handlers/invoiceHandlers/postInvoice');
const { getAllInvoices, getInvoiceById, getInvoicesByQuery } = require('../../handlers/invoiceHandlers/getInvoices');
const { updateInvoice } = require('../../handlers/invoiceHandlers/updateInvoice');
const confirmInvoice = require('../../handlers/invoiceHandlers/confirmInvoice');
const deliverInvoice = require('../../handlers/invoiceHandlers/deliverInvoice');
const payInvoice = require('../../handlers/invoiceHandlers/payInvoice');
const cancelInvoice = require('../../handlers/invoiceHandlers/cancelInvoice');
const authMiddleware = require('../../middlewares/auth');
const { activeClientOnly, adminOnly } = require('../../middlewares/adminOnly');

//Client routes
invoicesRouter.use(authMiddleware);

//Only active clients
invoicesRouter.use(activeClientOnly);

invoicesRouter.post('/', postInvoice);
invoicesRouter.patch('/:id', updateInvoice);
invoicesRouter.post('/:id/confirm', confirmInvoice);
invoicesRouter.post('/:id/cancel', cancelInvoice);

//Admin routes
invoicesRouter.use(adminOnly);

invoicesRouter.get('/:id', getInvoiceById);
invoicesRouter.get('/all', getAllInvoices);
invoicesRouter.get('/search', getInvoicesByQuery);
invoicesRouter.post('/:id/deliver', deliverInvoice);

//Webhook
invoicesRouter.post('/:id/paid', payInvoice);

module.exports = invoicesRouter;