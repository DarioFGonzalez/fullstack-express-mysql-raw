# Devlog
## [TOGGLE Client]

### Activar/desactivar cliente en bbdd

- Ahora podemos archivar/activar un cliente
- Borrar (DESTROY) los datos de un cliente también se llevaría facturas, registros, pagos, fechas... no tiene mucho sentido.
- Opté por 'desactiarla' con toggle-client así queda desactivado pero con registros activos

## [UPDATE Client] 2026-03-24

### Ruta para actualizar datos del cliente

- Archivo: `src/handlers/clientHandlers/updateClients.js`
- Endpoints:
  - [PATCH] /:id
  - [PATCH] /:id/change-password
- Para actualizar datos generales del cliente tenemos una lista de "fields autorizados".
- Checkeamos que esté intentando de cambiar algo autorizado y lo sumamos al query
- En caso de ser la contraseña, tenemos una ruta específica para eso:
  - Validamos el formato de la nueva contraseña
  - Comparamos con la anterior para evitar reemplazar con lo mismo
  - Verificamos que la contraseña anterior sea correcta
  - Hasheamos la contraseña nueva (bcrypt.hash)
  - Enviamos el UPDATE SET para actualizar

## [VERIFY Client] 2026-03-24

### Ruta para dar de alta cliente usando token de seguridad

- Archivo: `src/handlers/clientHandlers/verifyClient.js`
- Endpoint: `GET /clients/verify/:verification_token`
  - Validación de formato del token (hexadecimal de 64 caracteres)
  - Búsqueda por token y actualización en una sola query usando `affectedRows`
  - Actualizaciones:
    - `verification_token = NULL`
    - `verified_at = NOW()`
    - `is_active = true`

[Manejo de errores]
- `400 INVALID_TOKEN_FORMAT` → token no cumple el formato esperado
- `400 INVALID_OR_ALREADY_VERIFIED` → token no existe o cuenta ya activada

[Optimización]
- Uso de `affectedRows` para evitar un `SELECT` previo

### Búsqueda de clientes por query actualizado

- Podemos buscar por varios query a la vez
- Implementé una forma más dinámica para concatenar clausulas WHERE y sus valores

## [POST Client] 2026-03-23

### Ruta para creación de clientes agregada

- Archivo: `src/handlers/clientHandlers/postClient.js`
- Terminé el endpoint para creación de `clientes`:
  - Verificamos que nos llegó la información obligatoria (name, password, email...)
  - Validamos formato de email y contraseña recibidos (RegExp)
  - Hasheamos la contraseña antes de seguir con el proceso
  - Preparamos un query dependiendo la información que nos llegó por body
  - Insertamos el nuevo registro, traemos el nuevo registro de DDBB sacandole contraseña y token de verificación
  - Devolvemos el nuevo registro.

### Servicio de validaciones creado

- Archivo: `src/services/validations.js`
- Contiene funciones reutilizables para validar:
  - UUID
  - Email
  - Password
- Separación de responsabilidades: los handlers manejan la lógica de request/response, las validaciones se extraen a servicios para mantener el código limpio y testeable.

### Siguientes metas (orden de ejecución)
1. [ ] PATCH `/clients/verify` → verificar token y actualizar is_active: true
2. [ ] GET `/clients` → Traer todos los registros de clientes
3. [ ] GET `/clients/:id` → Traer clientes usando ID o 
4. [ ] POST `/clients/login` → Comparar contraseña, actualizar last_login, devolver datos del cliente y a futuro manejar JWT.

## [Clients Module] 2026-03-23

### Cambios en la base de datos
- Saqué la tabla `users`, creé `clients` en su lugar pensando en:
  - Simular un negocio real de mayoreo
  - Agregar verificación por correo electrónico
  - Darle a futuro un dashboard para revisar sus facturas y preferencias, o incluso pagar desde la app.

- Borré todas las tablas y arranqué de cero. Decisión consciente para evitar deuda técnica temprana y construir con una arquitectura más planeada.
- Estoy priorizando un enfoque más profesional/real de la app: voy a ir creando un CRUD a la vez, integrando las tablas de a poco, y chequeando que todo avance de manera armoniosa.

### Siguientes metas (orden de ejecución)
1. [ ] POST `/clients/register` → bcrypt + token de verificación
2. [ ] GET `/clients/verify` → activar cuenta
3. [ ] POST `/clients/login` → autenticación
4. [ ] GET `/clients` (con filtros y paginación)
5. [ ] PATCH `/clients/:id`
6. [ ] Modelo de `products`

### Notas
- Usando queries puras de MySQL, sin ORM.
- Una vez termine CLIENTS por completo (edge cases, errores, regexp) avanzo a la siguiente tabla.
- Todo el código se va a ir subiendo por partes, con commits claros y documentación paralela.

![Esquema actual de la tabla clients](./public/image.png)
*Tabla `clients` - estructura actual (2026-03-23)*