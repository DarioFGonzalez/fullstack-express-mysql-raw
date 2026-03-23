const server = require('./src/server');
const pool = require('./src/config/db');

async function startServer() {
    try {
        const [result] = await pool.query('SELECT 1 as connected');
        console.log('Base de datos conectada', result);

        server.listen( 5000, () => console.log('servidor conectado en puerto 5000') );
    }
    catch(error) {
        console.error('Error al iniciar:', error);
        process.exit(1);
    }
}

startServer();