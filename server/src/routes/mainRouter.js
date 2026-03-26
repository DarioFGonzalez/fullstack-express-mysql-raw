const {Router} = require('express');
const mainRouter = Router();
const clientsRouter = require('./clientsRouter/clientsRouter');
const productsRouter = require('./productsRouter/productsRouter');

mainRouter.use('/clients', clientsRouter);
mainRouter.use('/products', productsRouter);

module.exports = mainRouter;