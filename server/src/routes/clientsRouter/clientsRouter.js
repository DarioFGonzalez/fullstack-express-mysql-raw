const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getClients, getClientById } = require('../../handlers/clientHandlers/getClients');

clientsRouter.get('/', getClients);
clientsRouter.get('/:id', getClientById);
clientsRouter.post('/', postClient);

module.exports = clientsRouter;