const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getAllClients, getClientById, getClientsByQuery } = require('../../handlers/clientHandlers/getClients');
const verifyClient = require('../../handlers/clientHandlers/verifyClient');

clientsRouter.post('/', postClient);

clientsRouter.get('/verify/:verification_token', verifyClient);

clientsRouter.get('/all', getAllClients);
clientsRouter.get('/:id', getClientById);
clientsRouter.get('/search', getClientsByQuery);

module.exports = clientsRouter;