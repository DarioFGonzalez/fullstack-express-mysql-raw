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
            schemas: {
                Client: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Identificador único universal (UUID) del cliente. Generado automáticamente en el momento del registro.'
                        },
                        business_name: {
                            type: 'string',
                            minLength: 1,
                            description: 'Razón social completa o nombre comercial legalmente registrado de la empresa cliente.'
                        },
                        tax_id: {
                            type: 'string',
                            minLength: 5,
                            description: 'Identificador fiscal único de la entidad (ej CUIT/RUT). Se utiliza para la validación de identidad y facturación.'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Dirección de correo electrónico institucional. Actúa como identificador de acceso y canal principal de notificaciones legales.'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            description: 'Contraseña de acceso al sistema. Debe ser almacenada mediante hashing y cumplir con políticas de seguridad.'
                        },
                        phone: {
                            type: 'string',
                            nullable: true, 
                            description: 'Línea telefónica principal de contacto de la organización.'
                        },
                        address: {
                            type: 'string',
                            nullable: true,
                            description: 'Domicilio fiscal o dirección de contacto de la organización.'
                        },
                        contact_name: {
                            type: 'string',
                            nullable: true,
                            description: 'Nombre y apellido de la persona de contacto designada o representante administrativo.'
                        },
                        contact_phone: {
                            type: 'string',
                            nullable: true,
                            description: 'Telefono de contacto administrativo.'
                        },
                        last_login: {
                            type: 'string',
                            nullable: true,
                            description: 'Fecha y hora del último inicio de sesión exitoso. Se actualiza automáticamente con cada login.'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'active', 'inactive'],
                            description: 'Estado actual de la cuenta del cliente. pending = email sin verificar, confirmed = email verificado pendiente aprobación admin, active = cuenta habilitada para operar, inactive = cuenta desactivada por el cliente.'
                        },
                        is_admin: {
                            type: 'integer',
                            enum: [0, 1],
                            description: 'Indica si el cliente tiene privilegios de administrador. 0 = cliente común, 1 = administrador.'
                        }
                    }
                },
                postClient: {
                    type: 'object',
                    required: [ 'business_name', 'tax_id', 'email', 'password' ],
                    properties: {
                        business_name: {
                            type: 'string',
                            minLength: 1,
                            description: 'Razón social completa o nombre comercial legalmente registrado de la empresa cliente.'
                        },
                        tax_id: {
                            type: 'string',
                            minLength: 5,
                            description: 'Identificador fiscal único de la entidad (ej CUIT/RUT). Se utiliza para la validación de identidad y facturación.'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Dirección de correo electrónico institucional. Actúa como identificador de acceso y canal principal de notificaciones legales.'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            minLength: 8,
                            description: 'Contraseña de acceso al sistema. Debe ser almacenada mediante hashing y cumplir con políticas de seguridad.'
                        },
                        phone: {
                            type: 'string',
                            nullable: true, 
                            description: 'Línea telefónica principal de contacto de la organización.'
                        },
                        address: {
                            type: 'string',
                            nullable: true,
                            description: 'Domicilio fiscal o dirección de contacto de la organización.'
                        },
                        contact_name: {
                            type: 'string',
                            nullable: true,
                            description: 'Nombre y apellido de la persona de contacto designada o representante administrativo.'
                        },
                        contact_phone: {
                            type: 'string',
                            nullable: true,
                            description: 'Telefono de contacto administrativo.'
                        }
                    }
                },
                updateClient: {
                    type: 'object',
                    properties: {
                        phone: { type: 'string' },
                        address: { type: 'string' },
                        contact_name: { type: 'string' },
                        contact_phone: { type: 'string' }
                    }
                },
                errorMessage: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        code: { type: 'string' }
                    }
                }
            },
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