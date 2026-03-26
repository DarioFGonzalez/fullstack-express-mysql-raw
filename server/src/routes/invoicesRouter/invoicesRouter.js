const {Router} = require('express');
const invoicesRouter = Router();
const postInvoice = require('../../handlers/invoiceHandlers/postInvoice');

invoicesRouter.post('/', postInvoice);

module.exports = invoicesRouter;