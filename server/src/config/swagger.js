const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'B2B Stock reserve API',
            version: '1.0.0',
            "x-dev-access": 'e2b2ff5c05be70cf10f201f8c2e8241020b08fb1a6583c183669a870f1ef44fdf4a0ad18a817004c2baf1b1da28ee2158218edec3db2c21a86b968df5d80b663',
            description: 
            'Este es el motor de una plataforma B2B enfocada en lo importante: gestionar clientes, inventario y facturación de forma atómica.\n\n' +
            '### 🛠️ Stack y Enfoque\n' +
            'Para este proyecto decidí ir por un camino más artesanal y sólido:\n' +
            '* **Base de Datos:** MySQL usando **Raw Queries**. Sin ORMs; las consultas están escritas con builders personalizados para tener control total sobre performance y estructura de datos.\n' +
            '* **Seguridad:** Autenticación con JWT, roles de usuario y lógica de estados (Activo, Inactivo, Pendiente).\n' +
            '* **Documentación:** Swagger para cada ruta. Cada una con ejemplos de éxito, errores y edge cases además de todos los errores con sus ejemplos y schemas debidamente documentados.\n\n' +
            '---\n\n' +
            '### 🔑 Guía de Accesos\n' +
            'Cada ruta tiene un icono en su descripción inicial para saber que necesitas para usarla sin tener que leer todo el flujo:\n\n' +
            '* **👥 Acceso Público:** Rutas abiertas (Login, Registro, etc.).\n' +
            '* **👤 Requiere Token:** Para clientes logueados. Tenés que pasar el `Bearer Token` en los headers.\n' +
            '* **🔐 Solo Admin:** Rutas de gestión crítica, exclusivas para usuarios con privilegios de administrador.\n\n' +
            '---\n' +
            '**Desarrollado por Darío González, full stack web developer amante del código.**',
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
                clientPublic: {
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
                },
                clientPrivate: {
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
                        },
                        invoices: {
                            type: 'array',
                            description: 'Listado histórico de facturas asociadas al cliente.',
                            items: {
                                type: 'object',
                                properties: {
                                    invoice_id: { type: 'string' },
                                    status: { type: 'string', enum: ['confirmed','delivered','paid','cancelled'] },
                                    issue_date: { type: 'string', format: 'date' },
                                    total: { type: 'number', format: 'double' }
                                }
                            }
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
                    description: 
                    '### 🔒 Autenticación JWT\n\n' +
                    'Usá uno de los siguientes tokens para probar directamente desde el botón **Authorize**:\n\n' +
                    '#### 👤 Cliente\n' +
                    '```\n' +
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFhYWFhYWFhLWFhYWEtYWFhYS1hYWFhLWFhYWFhYWFhYWFhYSIsImlhdCI6MTc3ODI2NjE2OX0.i6Yy2RKn-0L0IUNqqrHZIitT65qTUXWph5VVqmZbCN8\n' +
                    '```\n\n' +
                    '#### 🔐 Administrador\n' +
                    '```\n' +
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJiYmJiYmJiLWJiYmItYmJiYi1iYmJiLWJiYmJiYmJiYmJiYiIsImlhdCI6MTc3ODI2NjE2OX0.cYOl52pFNLxugK_Jcj7RthjvIHtcLwo5ComnbMnAXik\n' +
                    '```\n\n' +
                    '#### 🚫 Sin token\n' +
                    'No ingreses nada en el authorize para testear las respuestas **401 Unauthorized**.'
                }
            },
            parameters: {
                queryBusinessName: {
                    in: 'query',
                    name: 'business_name',
                    example: 'Admin Demo',
                    schema: { type: 'string' },
                    explode: false,
                    style: 'form',
                    description: 'Razón social completa o nombre comercial legalmente registrado de la empresa cliente.'
                },
                queryTaxId: {
                    in: 'query',
                    name: 'tax_id',
                    example: '30-87654321-0',
                    schema: { type: 'string' },
                    description: 'Identificador fiscal único de la entidad (ej CUIT/RUT). Se utiliza para la validación de identidad y facturación.'
                },
                queryEmail: {
                    in: 'query',
                    name: 'email',
                    example: 'admin@demo.com',
                    schema: { type: 'string' },
                    description: 'Dirección de correo electrónico institucional. Actúa como identificador de acceso y canal principal de notificaciones legales.'
                },
                queryPhone: {
                    in: 'query',
                    name: 'phone',
                    example: '1145678902',
                    schema: { type: 'string' },
                    description: 'Línea telefónica principal de contacto de la organización.'
                },
                queryAddress: {
                    in: 'query',
                    name: 'address',
                    example: 'Av. Santa Fe 5678',
                    schema: { type: 'string' },
                    description: 'Domicilio fiscal o dirección de contacto de la organización.'
                },
                queryContactName: {
                    in: 'query',
                    name: 'contact_name',
                    example: 'Maria Gonzalez',
                    schema: { type: 'string' },
                    description: 'Nombre y apellido de la persona de contacto designada o representante administrativo.'
                },
                queryContactPhone: {
                    in: 'query',
                    name: 'contact_phone',
                    example: '1156789013',
                    schema: { type: 'string' },
                    description: 'Telefono de contacto administrativo.'
                },
                queryIsAdmin: {
                    in: 'query',
                    name: 'is_admin',
                    example: 1,
                    schema: { type: 'integer', enum: [0, 1] },
                    description: 'Indica si el cliente tiene privilegios de administrador. 0 = cliente común, 1 = administrador.'
                },
                queryStatus: {
                    in: 'query',
                    name: 'status',
                    example: 'active',
                    schema: { type: 'string', enum: [ 'pending', 'confirmed', 'active', 'inactive' ] },
                    description: 'Estado actual de la cuenta del cliente. pending = email sin verificar, confirmed = email verificado pendiente aprobación admin, active = cuenta habilitada para operar, inactive = cuenta desactivada por el cliente.'
                },
            },
            examples: {
            }
        }
    },
    apis: ['./src/routes/**/*.js', './src/handlers/*.js']
};

module.exports = swaggerJSDoc(options);