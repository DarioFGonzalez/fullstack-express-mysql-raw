const server = require('./src/server');
const pool = require('./src/config/db');
const PORT = 5000;

async function startServer() {
    try {
        const [result] = await pool.query('SELECT 1 as connected');

        server.listen( PORT, () => console.log(`servidor conectado en puerto ${PORT}`) );
    }
    catch(error) {
        console.error('Error al iniciar:', error);
        process.exit(1);
    }
}

startServer();