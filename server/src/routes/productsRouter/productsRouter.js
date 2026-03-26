const {Router} = require('express');
const productsRouter = Router();
const postProduct = require('../../handlers/productHandlers/postProduct');
const { getAllproducts, getProductById, getProductsByQuery } = require('../../handlers/productHandlers/getProducts');

productsRouter.post('/', postProduct);

productsRouter.get('/all', getAllproducts);
productsRouter.get('/search', getProductsByQuery);
productsRouter.get('/:id', getProductById);

// productsRouter.patch('/:id', updateProduct);

// productsRouter.patch('/:id/toggle-active', toggleProduct);

module.exports = productsRouter;