const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getAllClients, getClientById, getClientsByQuery } = require('../../handlers/clientHandlers/getClients');
const { changeMyPassword, updateMyProfile, deactivateMySelf } = require('../../handlers/clientHandlers/updateClients');
const loginClient = require('../../handlers/clientHandlers/loginClient');
const {verifyMail, sendReactivationMail, reactivateMyAccount} = require('../../handlers/clientHandlers/verifyClient');
const authMiddleware = require('../../middlewares/auth');
const adminOnly = require('../../middlewares/adminOnly');
const { getMyProfile, getMyInvoices, getMyActiveInvoice } = require('../../handlers/clientHandlers/getMyData');

//CLIENT Router
clientsRouter.post('/', postClient);

clientsRouter.get('/me/verify/:verification_token', verifyMail);

clientsRouter.post('/login', loginClient);

clientsRouter.use(authMiddleware);

clientsRouter.get('/me', getMyProfile);
clientsRouter.get('/me/invoices', getMyInvoices);
clientsRouter.get('/me/invoices/active', getMyActiveInvoice);

clientsRouter.patch('/me', updateMyProfile);
clientsRouter.patch('/me/change-password', changeMyPassword);

clientsRouter.patch('/me/deactivate', deactivateMySelf);
clientsRouter.post('/me/reactivate', sendReactivationMail);
clientsRouter.patch('/me/reactivate/:verification_token', reactivateMyAccount)

//ADMIN Router
clientsRouter.get('/all', getAllClients);
clientsRouter.get('/search', getClientsByQuery);
clientsRouter.get('/:id', getClientById);


clientsRouter.patch('/:id/toggle-active', toggleClient);

module.exports = clientsRouter;