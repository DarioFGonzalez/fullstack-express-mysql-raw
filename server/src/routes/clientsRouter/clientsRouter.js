const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getAllClients, getClientById, getClientsByQuery } = require('../../handlers/clientHandlers/getClients');

clientsRouter.post('/', postClient);

clientsRouter.get('/all', getAllClients);
clientsRouter.get('/search', getClientsByQuery);
clientsRouter.get('/:id', getClientById);

module.exports = clientsRouter;