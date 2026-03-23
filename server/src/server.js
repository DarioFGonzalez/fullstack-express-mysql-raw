const express = require('express');
const cors = require('cors');
const server = express();
const pool = require('./config/db');
const mainRouter = require('./routes/mainRouter');

server.use( cors() );
server.use( express.json() );

server.use( (req, res, next) => {
    req.pool = pool;
    next();
})

server.use( mainRouter );

server.get('/', (req, res) => res.send('hola') );

module.exports = server;