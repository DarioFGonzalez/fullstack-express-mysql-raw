const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getAllClients, getClientById, getClientsByQuery } = require('../../handlers/clientHandlers/getClients');
const { updateClient, updatePassword, toggleClient } = require('../../handlers/clientHandlers/updateClients');
const loginClient = require('../../handlers/clientHandlers/loginClient');
const verifyClient = require('../../handlers/clientHandlers/verifyClient');
const authMiddleware = require('../../middlewares/auth');
const adminOnly = require('../../middlewares/adminOnly');

clientsRouter.post('/', authMiddleware, adminOnly, postClient);

clientsRouter.get('/verify/:verification_token', verifyClient);

clientsRouter.post('/login', loginClient);

clientsRouter.get('/all', getAllClients);
clientsRouter.get('/:id', getClientById);
clientsRouter.get('/search', getClientsByQuery);

clientsRouter.patch('/:id', updateClient);
clientsRouter.patch('/:id/change-password', updatePassword);

clientsRouter.patch('/:id/toggle-active', toggleClient);

module.exports = clientsRouter;