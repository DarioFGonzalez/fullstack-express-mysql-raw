const {Router} = require('express');
const productsRouter = Router();
const postProduct = require('../../handlers/productHandlers/postProduct');

productsRouter.post('/', postProduct);

module.exports = productsRouter;