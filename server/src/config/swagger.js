const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'B2B Stock reserve API',
            version: '1.0.0',
            description: 'REST API para manejo mayorista de stock, facturas e inventario.',
            contact: {
                name: 'Dario Fernando Gonzalez',
                email: 'dario.zerobyte@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Servidor local'
            }
        ],
        components: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    apis: ['./src/routes/**/*.js', './src/handlers/*.js']
};

module.exports = swaggerJSDoc(options);