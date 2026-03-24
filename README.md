# Fullstack Express + MySQL (Raw Queries)

## ¿Qué es esto?

Una plataforma de gestión de pedidos y facturación para empresas mayoristas.  
Permite registrar clientes (minoristas), administrar productos, generar facturas con plazos de pago, y ofrecer un portal para que los clientes consulten sus facturas y vencimientos.

## Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: MySQL (queries puras, sin ORM)
- **Frontend**: React (en desarrollo)
- **Autenticación**: bcrypt + JWT

## ¿Por qué sin ORM?

Para mantener control total sobre las consultas SQL, optimizar rendimiento, y demostrar conocimiento profundo de bases de datos relacionales.

## Estado actual

**Módulo de clientes completado**

- Tabla `clients` con UUID, verificación y contraseñas hasheadas
- Endpoints implementados:
  - `POST /clients` → registro con generación de token de verificación
  - `GET /clients/verify/:token` → activación de cuenta
  - `GET /clients/all` → listar todos los clientes
  - `GET /clients/search?queries=values` → búsqueda dinámica
  - `GET /clients/:id` → obtener cliente por ID

**Próximo: módulo de productos**

## Objetivo final

Un sistema funcional donde un mayorista pueda:

- Registrar sus clientes
- Gestionar productos y stock
- Emitir facturas con plazos de pago
- Dar acceso a sus clientes para consultar facturas y vencimientos