<div align="center">

# 🚀 **B2B Stock Reserve API** 
### *Transactional inventory system with ACID guarantees*

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Transactions](https://img.shields.io/badge/ACID-transactions-blue)
![Stock](https://img.shields.io/badge/feature-reserved--stock-orange)
![MySQL](https://img.shields.io/badge/MySQL-raw--queries-4479A1)

**⚡ 30+ endpoints | 🔐 JWT + roles | 📦 Reserved stock | 💰 Invoice lifecycle**

</div>

---

# 🏭 Fullstack Express + MySQL (Raw Queries)

API REST para gestión de pedidos y facturación B2B (mayorista).  
Sistema completo con manejo de stock reservado, ciclo de vida de facturas y operaciones transaccionales.  
**Sin ORM - queries SQL puras.**

## 🎯 ¿Qué problema resuelve este proyecto?

**Sistemas B2B mayoristas** necesitan:
- ✅ Reservar stock cuando un pedido se confirma (no cuando se paga)
- ✅ Liberar stock si el pedido se cancela
- ✅ Descontar stock real solo al entregar
- ✅ Todo dentro de transacciones ACID para que no haya inconsistencias

**Este proyecto implementa exactamente eso, con SQL puro y sin ORM.**

---

## 🚀 Tecnologías utilizadas

- Node.js + Express
- MySQL (mysql2/promise)
- bcrypt
- crypto (tokens)
- dotenv
- jsonwebtoken (JWT)

---

## 📂 Estructura del proyecto

```
src/
├── handlers/          # Controladores (req/res)
├── utils/             # Validaciones, query builders
├── config/            # DB connection pool
├── middlewares/       # auth, adminOnly, activeClientOnly
├── routes/            # Definición de endpoints
└── server.js          # Configuración Express
```

---

## 📌 La aplicación sigue una arquitectura:

**Routes → Middlewares → Handlers → Utils → Database**

### Esto permite:
- Separar responsabilidades
- Reutilizar lógica (query builders, validaciones)
- Mantener el código limpio y testeable
- Control de acceso por roles (admin / cliente)

---

## 🔐 Autenticación y autorización

- **JWT** para proteger rutas sensibles
- **`authMiddleware`** → verifica token y busca el estado actual del cliente en DB
- **`adminOnly`** → restringe rutas a usuarios con `is_admin = true`
- **`activeClientOnly`** → solo permite operaciones de escritura a clientes con `status = 'active'`
- El `status` no se guarda en el token, se consulta en cada request (consistencia garantizada)

---

## ✅ Validación de datos

- Helpers en `utils/validations.js`
- Validación de UUID, email, password, token, etc.
- Whitelist de columnas permitidas para búsquedas dinámicas
- Validación de enums (status, payment_terms)

---

## 🧠 Lógica de negocio clave

### Manejo de stock profesional
- `stock` → stock físico real
- `reserved_stock` → stock reservado en pedidos confirmados
- Ciclo: `draft` → `confirm` (reserva) → `deliver` (descarga)

### Transacciones SQL
- **Confirmación**: valida stock, reserva, genera número/fechas
- **Entrega**: descuenta stock real y libera reserva
- **Cancelación**: libera stock reservado

### Carrito como invoice en draft
- Un solo invoice por cliente en `draft`
- Items en `invoice_items`
- Cantidad `0` = eliminar item

---

## 📌 Endpoints

### 👤 Clientes

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/clients` | Registro con token de verificación | Público |
| `GET` | `/clients/verify/:token` | Activación de cuenta | Público |
| `POST` | `/clients/login` | Login (devuelve token) | Público |
| `GET` | `/clients/me` | Mi perfil | Cliente autenticado |
| `PATCH` | `/clients/me` | Actualizar mi perfil | Cliente autenticado |
| `PATCH` | `/clients/me/change-password` | Cambiar mi contraseña | Cliente autenticado |
| `PATCH` | `/clients/me/deactivate` | Desactivar mi cuenta | Cliente autenticado |
| `POST` | `/clients/me/reactivate` | Solicitar reactivación | Cliente autenticado |
| `PATCH` | `/clients/me/reactivate/:token` | Reactivar cuenta | Público (por token) |
| `GET` | `/clients/all` | Listar todos los clientes | Solo admin |
| `GET` | `/clients/search` | Búsqueda dinámica | Solo admin |
| `GET` | `/clients/:id` | Obtener cliente por ID | Solo admin |
| `PATCH` | `/clients/:id/toggle` | Activar/desactivar cliente | Solo admin |

### 📦 Productos

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `GET` | `/products/all` | Listar todos | Público |
| `GET` | `/products/search` | Búsqueda dinámica | Público |
| `GET` | `/products/:id` | Obtener por ID | Público |
| `POST` | `/products` | Crear producto | Solo admin |
| `PATCH` | `/products/:id` | Actualizar | Solo admin |
| `PATCH` | `/products/:id/toggle-active` | Soft delete | Solo admin |

### 🧾 Facturas / Pedidos (Invoices)

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| `POST` | `/invoices` | Crear carrito (`draft`) con primer item | Cliente activo |
| `GET` | `/invoices/me` | Mis facturas | Cliente autenticado |
| `GET` | `/invoices/me/active` | Mi carrito activo | Cliente autenticado |
| `GET` | `/invoices/me/:invoiceId` | Obtener una de mis facturas | Cliente autenticado |
| `PATCH` | `/invoices/:id` | Batch update (cantidad `0` = eliminar) | Cliente activo (solo draft) |
| `POST` | `/invoices/:id/confirm` | Confirmar pedido (✅ reserva stock) | Cliente activo |
| `POST` | `/invoices/:id/cancel` | Cancelar pedido (❌ libera stock) | Cliente activo |
| `GET` | `/invoices/all` | Listar todas | Solo admin |
| `GET` | `/invoices/search` | Búsqueda con rangos | Solo admin |
| `GET` | `/invoices/:id` | Obtener factura por ID | Solo admin |
| `POST` | `/invoices/:id/deliver` | Entregar (📦 descarga stock) | Solo admin |
| `POST` | `/invoices/:id/paid` | Marcar como pagado (💰) | Webhook / Admin |

---

## 🧠 Conceptos aplicados

- Arquitectura en capas
- Queries SQL puras (sin ORM)
- Placeholders parametrizados (SQL injection safe)
- UUID como primary keys
- Hash de contraseñas con bcrypt
- Token de verificación con crypto
- JWT con middlewares de autenticación y roles
- Soft delete con `is_active` / `status`
- Búsquedas dinámicas con whitelist
- Rangos numéricos y de fechas (`BETWEEN`, `>=`, `<=`)
- Batch updates (`INSERT ... ON DUPLICATE KEY UPDATE`)
- Transacciones SQL (`BEGIN` / `COMMIT` / `ROLLBACK`)
- Manejo de errores consistente
- Documentación con `devlog.md` y `CHANGELOG.md`

---

## ⚙️ Instalación y ejecución

```bash
git clone https://github.com/DarioFGonzalez/fullstack-express-mysql-raw.git
cd fullstack-express-mysql-raw/server
npm install
cp .env.example .env
npm run dev
```

## 🔒 Mejoras futuras

- Paginación en listados
- Webhook real de pagos (MercadoPago)
- Dashboard de administración
- Tests unitarios y de integración
- Documentación con Swagger

---

## 📊 Progreso actual

| Módulo | Estado |
|--------|--------|
| Clients CRUD | ✅ Completado |
| Clients self-service (perfil, cambio pass, reactivación) | ✅ Completado |
| Products CRUD | ✅ Completado |
| Invoices CRUD + ciclo de vida (confirm/deliver/paid/cancel) | ✅ Completado |
| Autenticación JWT + middlewares + roles | ✅ Completado |

---

## 👨‍💻 Autor

Dario Fernando Gonzalez
