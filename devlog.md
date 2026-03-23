# Devlog

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