const {Router} = require('express');
const productsRouter = Router();
const postProduct = require('../../handlers/productHandlers/postProduct');
const { getAllproducts, getProductById, getProductsByQuery } = require('../../handlers/productHandlers/getProducts');
const { updateProduct, toggleProduct } = require('../../handlers/productHandlers/updateProduct');
const authMiddleware = require('../../middlewares/auth');
const {adminOnly} = require('../../middlewares/adminOnly');

//Public routes
productsRouter.get('/all', getAllproducts);
productsRouter.get('/search', getProductsByQuery);
productsRouter.get('/:id', getProductById);

//Admin routes
productsRouter.use(authMiddleware, adminOnly);

productsRouter.post('/', postProduct);
productsRouter.patch('/:id', updateProduct);
productsRouter.patch('/:id/toggle-active', toggleProduct);

module.exports = productsRouter;