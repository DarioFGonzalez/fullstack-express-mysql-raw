# 🏭 Fullstack Express + MySQL (Raw Queries)

API REST para gestión de pedidos y facturación B2B (mayorista).  
Sistema completo con manejo de stock reservado, ciclo de vida de facturas y operaciones transaccionales.  
**Sin ORM - queries SQL puras.**

---

## 🚀 Tecnologías utilizadas

- Node.js + Express
- MySQL (mysql2/promise)
- bcrypt
- crypto (tokens)
- dotenv

---

## 📂 Estructura del proyecto

```
src/
├── handlers/          # Controladores (req/res)
├── utils/             # Validaciones, query builders
├── config/            # DB connection pool
├── routes/            # Definición de endpoints
└── server.js          # Configuración Express
```

---

## 📌 La aplicación sigue una arquitectura:

**Routes → Handlers → Utils → Database**

### Esto permite:
- Separar responsabilidades
- Reutilizar lógica (query builders, validaciones)
- Mantener el código limpio y testeable

---

## 🔐 Autenticación (próximo paso)

- JWT para proteger rutas sensibles
- Middleware de autenticación
- Roles: admin / cliente

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
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/clients` | Registro con token de verificación |
| `GET` | `/clients/verify/:token` | Activación de cuenta |
| `GET` | `/clients/all` | Listar todos |
| `GET` | `/clients/search?business_name=&email=&is_active=` | Búsqueda dinámica |
| `GET` | `/clients/:id` | Obtener por ID |
| `PATCH` | `/clients/:id` | Actualizar datos |
| `PATCH` | `/clients/:id/change-password` | Cambiar contraseña |
| `PATCH` | `/clients/:id/toggle-active` | Soft delete |

### 📦 Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/products` | Crear producto |
| `GET` | `/products/all` | Listar todos |
| `GET` | `/products/search?sku=&name=&category=&is_active=` | Búsqueda dinámica |
| `GET` | `/products/:id` | Obtener por ID |
| `PATCH` | `/products/:id` | Actualizar |
| `PATCH` | `/products/:id/toggle-active` | Soft delete |

### 🧾 Facturas / Pedidos (Invoices)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/invoices` | Crear carrito (`draft`) con primer item |
| `GET` | `/invoices/all` | Listar todas |
| `GET` | `/invoices/search?client_id=&status=&other_queries` | Búsqueda con rangos |
| `GET` | `/invoices/:id` | Obtener factura con items |
| `PATCH` | `/invoices/:id` | Batch update (cantidad `0` = eliminar) |
| `POST` | `/invoices/:id/confirm` | Confirmar pedido (✅ reserva stock) |
| `POST` | `/invoices/:id/deliver` | Entregar (📦 descarga stock) |
| `POST` | `/invoices/:id/paid` | Marcar como pagado (💰) |
| `POST` | `/invoices/:id/cancel` | Cancelar (❌ libera stock) |

---

## 🧠 Conceptos aplicados

- Arquitectura en capas
- Queries SQL puras (sin ORM)
- Placeholders parametrizados (SQL injection safe)
- UUID como primary keys
- Hash de contraseñas con bcrypt
- Token de verificación con crypto
- Soft delete con `is_active`
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

- JWT y middleware de autenticación
- Roles y permisos (admin / cliente)
- Paginación en listados
- Webhook de pagos (MercadoPago)
- Dashboard de administración
- Tests unitarios y de integración
- Documentación con Swagger

---

## 📊 Progreso actual

| Módulo | Estado |
|--------|--------|
| Clients CRUD | ✅ Completado |
| Products CRUD | ✅ Completado |
| Invoices (draft + search) | ✅ Completado |
| Confirm / Deliver / Cancel / Paid | ✅ Completado |
| Autenticación JWT | ⏳ Pendiente |

---

## 👨‍💻 Autor

Dario Fernando Gonzalez