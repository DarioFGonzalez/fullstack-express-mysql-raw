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

- Tabla `clients` con UUID, verificación por email y contraseñas hasheadas
- Endpoints implementados:
  - `POST /clients` → registro con generación de token de verificación
  - `GET /clients/verify/:token` → activación de cuenta
  - `GET /clients/all` → listar todos los clientes
  - `GET /clients/search?business_name=&email=&is_active=` → búsqueda dinámica
  - `GET /clients/:id` → obtener cliente por ID
  - `PATCH /clients/:id` → actualizar datos permitidos
  - `PATCH /clients/:id/change-password` → cambiar contraseña
  - `PATCH /clients/:id/toggle-active` → activar/desactivar cliente (soft delete)

**Módulo de productos completado**

- Tabla `products` con UUID, SKU único, stock y stock reservado
- Endpoints implementados:
  - `POST /products` → crear producto
  - `GET /products/all` → listar todos los productos
  - `GET /products/search?sku=&name=&category=&is_active=` → búsqueda dinámica
  - `GET /products/:id` → obtener producto por ID
  - `PATCH /products/:id` → actualizar datos permitidos
  - `PATCH /products/:id/toggle-active` → activar/desactivar producto (soft delete)

**Próximo: módulo de carritos (carts + cart_items)**

## Objetivo final

Un sistema funcional donde un mayorista pueda:

- Registrar sus clientes
- Gestionar productos y stock
- Emitir facturas con plazos de pago
- Dar acceso a sus clientes para consultar facturas y vencimientos