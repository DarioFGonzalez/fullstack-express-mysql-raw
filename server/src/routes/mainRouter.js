const {Router} = require('express');
const mainRouter = Router();
const clientsRouter = require('./clientsRouter/clientsRouter');

mainRouter.use('/clients', clientsRouter);

module.exports = mainRouter;