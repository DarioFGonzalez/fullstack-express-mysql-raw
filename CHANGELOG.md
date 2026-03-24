# Changelog

## [Clients Module] - 2026-03-24

### Added
- **PATCH /clients/:id** (`src/handlers/clientHandlers/updateClients.js`)
  - Update allowed fields: `phone`, `address`, `contact_name`, `contact_phone`, `business_name`
  - Validates at least one field is provided
  - Returns updated client without sensitive data
  - Whitelist validation for updatable fields

- **PATCH /clients/:id/change-password** (`src/handlers/clientHandlers/updateClients.js`)
  - Requires `password` (current) and `newPassword`
  - Validates `newPassword` format (min 8 chars, at least one letter and one number)
  - Prevents reusing the same password
  - Verifies current password with bcrypt
  - Hashes new password with bcrypt (10 rounds) before update

- **PATCH /clients/:id/toggle-active** (`src/handlers/clientHandlers/updateClients.js`)
  - Soft delete / activate client
  - Flips `is_active` value (0 ↔ 1)
  - Returns updated client status

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

- **GET /clients/all** (`src/handlers/clientHandlers/clients.js`)
  - Returns all clients with filtered fields (excludes password, verification_token)

- **GET /clients/:id** (`src/handlers/clientHandlers/clients.js`)
  - Returns single client by UUID
  - 404 if not found

### Changed
- Refactored `getClientsByQuery` to support multiple filters dynamically
- Added whitelist validation for query parameters
- Moved `validations.js` from `services/` to `utils/` for consistency
- Created `queryBuilder.js` utility for dynamic WHERE clause generation

### Next Steps
- [ ] Products module (table + CRUD)
- [ ] Invoices with invoice_items
- [ ] JWT authentication for admin endpoints

### Notes
- All updates use parameterized queries (SQL injection safe)
- No hard deletes - `toggle-active` handles client deactivation
- Password update requires current password verification (security best practice)

---

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
- **Validation service** (`src/utils/validations.js`)
  - `isValidUUID()` - UUID format validation
  - `isValidEmail()` - email format validation
  - `isValidPassword()` - password strength validation (min 8 chars, at least one letter and one number)

- **POST /clients** (`src/handlers/clientHandlers/postClient.js`)
  - Required fields validation (business_name, tax_id, email, password)
  - Email and password format validation
  - Password hashing with bcrypt (10 rounds)
  - Token generation with `crypto.randomBytes(32).toString('hex')`
  - Dynamic query builder for optional fields (phone, address, contact_name, contact_phone)
  - Returns created client without sensitive data
  - Handles duplicate entries with 409 Conflict response

### Technical Decisions
- Raw MySQL queries with parameterized placeholders (SQL injection safe)
- UUID generation handled by MySQL `DEFAULT (UUID())`
- Connection pool configured with mysql2/promise
- No ORM - full control over queries

### Notes
- All inserts use placeholders (`?`) to prevent SQL injection
- is_active defaults to false until email verification
- verification_token to be sent via email (Nodemailer pending)