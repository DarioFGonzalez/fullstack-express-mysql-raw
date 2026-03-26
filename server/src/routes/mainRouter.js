const {Router} = require('express');
const mainRouter = Router();
const clientsRouter = require('./clientsRouter/clientsRouter');
const productsRouter = require('./productsRouter/productsRouter');
const invoicesRouter = require('./invoicesRouter/invoicesRouter');

mainRouter.use('/clients', clientsRouter);
mainRouter.use('/products', productsRouter);
mainRouter.use('/invoices', invoicesRouter);

module.exports = mainRouter;