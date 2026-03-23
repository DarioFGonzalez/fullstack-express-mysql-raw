const {Router} = require('express');
const usersRouter = Router();
const { postUser } = require('../../handlers/userHandlers/postUser');
const { getUsers, getUserById } = require('../../handlers/userHandlers/getUsers');

usersRouter.get('/', getUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', postUser);

module.exports = usersRouter;