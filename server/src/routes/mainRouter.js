const {Router} = require('express');
const mainRouter = Router();
const usersRouter = require('./usersRouter/usersRouter');

mainRouter.use('/users', usersRouter);

module.exports = mainRouter;