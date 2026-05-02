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
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: `
                    ### 🔐 Autenticación JWT

                    Usá uno de los siguientes tokens para probar:

                    #### 👤 Cliente

                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWFhLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhYSIsImlhdCI6MTc3NzY1MzAyNX0.xS1zXbBYmVk-1RLrQefYNX102ZA3D46DJrPbPxodffo

                    #### 🛠️ Administrador

                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYmJiYmJiLWJiYmItYmJiYi1iYmJiLWJiYmJiYmJiYmJiYiIsImlhdCI6MTc3NzY1MzA4MX0.mHcvgHHsrlyelkXaw5KUuBqVz0lv9Dml8n_vIEl4Shs


                    #### 🚫 Sin token
                    No ingreses nada para probar respuestas 401.
                    `
                }
            }
        }
    },
    apis: ['./src/routes/**/*.js', './src/handlers/*.js']
};

module.exports = swaggerJSDoc(options);