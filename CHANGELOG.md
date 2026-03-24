# Changelog

## [Clients Module] - 2026-03-24

### Added
- **GET /clients/verify/:verification_token** (`src/handlers/clientHandlers/verifyClient.js`)
  - Account activation via token
  - Token format validation (hexadecimal, 64 chars)
  - Single query update using `affectedRows` (no SELECT)
  - Sets `is_active = true`, `verified_at = NOW()`, `verification_token = NULL`

- **GET /clients/search** (`src/handlers/clientHandlers/clients.js`)
  - Dynamic query builder for multiple filters
  - Whitelist validation for allowed columns (business_name, email, is_active, tax_id, phone)
  - Supports `LIKE` for business_name (partial match)
  - Returns array of clients (200) even if empty

- **GET /clients** (`src/handlers/clientHandlers/clients.js`)
  - Returns all clients with filtered fields (excludes password, verification_token)

- **GET /clients/:id** (`src/handlers/clientHandlers/clients.js`)
  - Returns single client by UUID
  - 404 if not found

### Changed
- Refactored `getClientsByQuery` to support multiple filters dynamically
- Added whitelist validation for query parameters

### Next Steps
- [ ] POST `/clients/login` → authentication with bcrypt
- [ ] PATCH `/clients/:id` → update client information
- [ ] Products module (table + CRUD)
- [ ] Invoices with invoice_items

## [Clients Module] - 2026-03-23

### Schema
- Dropped `users` table, created `clients` with:
  - `id CHAR(36) PRIMARY KEY DEFAULT (UUID())`
  - `business_name VARCHAR(255) NOT NULL UNIQUE`
  - `tax_id VARCHAR(50) NOT NULL UNIQUE`
  - `email VARCHAR(100) NOT NULL UNIQUE`
  - `phone VARCHAR(20) NULL`
  - `address TEXT NULL`
  - `contact_name VARCHAR(100) NULL`
  - `contact_phone VARCHAR(20) NULL`
  - `password VARCHAR(255) NOT NULL`
  - `verification_token VARCHAR(255) NULL`
  - `verified_at TIMESTAMP NULL`
  - `is_active BOOLEAN DEFAULT false`
  - `last_login TIMESTAMP NULL`
  - `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

### Added
- **Validation service** (`src/services/validations.js`)
  - `isValidUUID()` - UUID v4 format validation
  - `isValidEmail()` - email format validation (min 3 chars before @, valid domain)
  - `isValidPassword()` - password strength validation (min 8 chars, at least one letter and one number)

- **POST /clients/register** (`src/handlers/clientHandlers/postClient.js`)
  - Required fields validation (business_name, tax_id, email, password)
  - Email and password format validation
  - Password hashing with bcrypt (10 rounds)
  - Dynamic query builder for optional fields (phone, address, contact_name, contact_phone)
  - Returns created client without sensitive data (password, verification_token)
  - Handles duplicate entries with 409 Conflict response

### Technical Decisions
- Raw MySQL queries with parameterized placeholders (SQL injection safe)
- UUID generation handled by MySQL `DEFAULT (UUID())`
- Connection pool configured with mysql2/promise
- No ORM - full control over queries

### Next Steps
- [ ] GET `/clients/verify` → account activation via token
- [ ] GET `/clients` → list all clients (with pagination)
- [ ] GET `/clients/:id` → get client by ID
- [ ] POST `/clients/login` → authentication with last_login update
- [ ] PATCH `/clients/:id` → update client information
- [ ] Products module (table + CRUD)

### Notes
- All inserts/updates use placeholders (`?`) to prevent SQL injection
- is_active defaults to false until email verification
- verification_token to be sent via email (Nodemailer pending)