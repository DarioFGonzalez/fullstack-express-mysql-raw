# Devlog

## 2026-03-23

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