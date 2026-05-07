const {Router} = require('express');
const clientsRouter = Router();
const postClient = require('../../handlers/clientHandlers/postClient');
const { getAllClients, getClientById, getClientsByQuery } = require('../../handlers/clientHandlers/getClients');
const { changeMyPassword, updateMyProfile, deactivateMySelf, toggleClient, toggleAdmin } = require('../../handlers/clientHandlers/updateClients');
const loginClient = require('../../handlers/clientHandlers/loginClient');
const {verifyMail, sendReactivationMail, reactivateMyAccount} = require('../../handlers/clientHandlers/verifyClient');
const authMiddleware = require('../../middlewares/auth');
const {adminOnly} = require('../../middlewares/adminOnly');
const getMyProfile = require('../../handlers/clientHandlers/getMyData');

//Public routes

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: (Público) Crear un nuevo registro de cliente.
 *     description: Crea un nuevo registro de cliente con los datos enviados.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/postClient'
 *           examples:
 *               solo_datos_necesarios:
 *                 summary: ✔ Enviamos solo datos necesarios.
 *                 description: El registro se crea exitosamente con el estado inicial 'pending'.
 *                 value:
 *                   business_name: Freelance mayhem S.A.
 *                   tax_id: 25-36999123-1
 *                   email: FreeMay@consultas.com
 *                   password: freemay123freemay
 *               enviar_con_datos_opcionales:
 *                 summary: ✔ Enviamos datos mandatorios y opcionales.
 *                 description: Se incluyen datos de contacto y dirección para completar el perfil desde el inicio.
 *                 value:
 *                   business_name: Corporate TECH & Cia.
 *                   tax_id: 23-338492012-2
 *                   email: ctech@consultas.com
 *                   password: ctech123ctech
 *                   phone: 47469283
 *                   address: Pueyrredón 3022
 *                   contact_name: Rodizio Fernandez
 *                   contact_phone: 1557483920
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra/inválido será ignorado.
 *                 description: En caso de recibir datos extra ó inválidos estos serán ignorados y se creará el registro con los datos mandatorios.
 *                 value:
 *                   business_name: Freelance mayhem S.A.
 *                   tax_id: 25-36999123-1
 *                   email: FreeMay@consultas.com
 *                   password: freemay123freemay
 *                   vip_status: true
 *                   international: false
 *                   iva: 21
 *                   etc: other extra slots
 *               falta_dato_obligatorio:
 *                 summary: ✖ No enviamos todos los datos necesarios.
 *                 description: En caso de no recibir datos clave, recibiremos un error detallando los campos faltantes.
 *                 value:
 *                   business_name: Salvation 300 & Cia.
 *                   tax_id: 19-32199123-2
 *                   email: salvation300@consultas.com
 *                   phone: 47669283
 *                   address: Gral Espejo 421
 *     responses:
 *       201:
 *         description: |
 *           ### ✅ Cliente creado con éxito
 *           
 *           Sigue estos pasos para verificar la cuenta:
 *           
 *           1. **Copia** el `verification_token` que aparece en el cuerpo de esta respuesta.
 *           2. **Haz click** en el siguiente enlace para ir al validador:
 *              [IR A VERIFICAR EMAIL](#operations-Clients-verifyClient)
 *           3. **Pega** el token en el campo correspondiente y presiona *Execute*.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 business_name:
 *                   type: string
 *                 tax_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 is_admin:
 *                   type: integer
 *                 verification_token:
 *                   type: string
 *             example:
 *               id: 08ed9059-26f3-11f1-bf6b-e4fd45b45662
 *               email: Alpine@consultas.com
 *               business_name: Alpine TECH
 *               tax_id: 25-930201-3
 *               status: pending
 *               is_admin: 0
 *               verification_token: 96b9fc202999f7f65c03280ee21505444edb2ec2168a5e36a08f3abae30273e0
 *       400:
 *         description: Faltan campos obligatorios o se enviaron valores con formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - error
 *                 - code
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *                 missingFields:
 *                   type: array
 *                   items:
 *                     type: string
 *             examples:
 *               email_o_password_no_recibidos:
 *                 summary: ✖ Email o Password no recibidos
 *                 value:
 *                   error: Contraseña no recibida || Email no recibido
 *                   code: PASSWORD_REQUIRED || EMAIL_REQUIRED
 *               email_o_password_con_formato_inválido:
 *                 summary: ✖ Email o Password con formato inválido
 *                 value:
 *                   error: Formato de la contraseña inválido || Formato del email inválido
 *                   code: INVALID_EMAIL_FORMAT || INVALID_PASSWORD_FORMAT
 *               faltan_datos_obligatorios:
 *                  summary: ✖ Faltan campos obligatorios
 *                  value:
 *                    error: Faltan campos obligatorios- business_name, tax_id, email, password
 *                    code: MISSING_REQUIRED_FIELDS
 *                    missingFields: [ business_name, tax_id, email, password ]
 *       409:
 *         description: Ya existe un registro con valor clave idéntico.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: El cliente ya existe
 *               code: ER_DUP_ENTRY
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             examples:
 *               no_pudimos_traer_el_cliente_recien_creado:
 *                  summary: ✖ No se pudo traer el cliente nuevo de DDBB
 *                  value:
 *                    error: Error al recuperar el cliente creado
 *                    code: DATA_CONSISTENCY_ERROR
 *               error_interno_general:
 *                  summary: ✖ Error interno inesperado
 *                  value:
 *                    error: Error interno del servidor
 *                    code: INTERNAL_SERVER_ERROR
 */

clientsRouter.post('/', postClient);

/**
 * @swagger
 * /clients/me/verify/{verification_token}:
 *   get:
 *     summary: Verificamos el cliente mediante un token único.
 *     operationId: verifyClient
 *     description: Si el token coincide con el del cliente y la cuenta está en estado 'pendiente', la actualizamos a 'confirmada' y borramos el token.
 *     tags:
 *       - Clients
 *     parameters:
 *      - in: path
 *        name: verification_token
 *        required: true
 *        schema:
 *          type: string
 *          example: a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890
 *        description: Token único de verificación del cliente. (32 caracteres hex)<br>Casos de prueba:<br><br>- Token válido    (Simulado)          ->  `7eff170bf6872bff6ce8d4af1c97114aa890da7fa4449554d0378d076906bec1`<br><br>- Error 401       (Formato inválido)  ->  `invalid-token-123`<br><br>- Error 400       (Requerido)         ->  ` `
 *     responses:
 *       200:
 *         description: Mail del cliente verificado. Se borra el token, se actualiza el estado a "confirmed" y devolvemos un mensaje de éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               code: Success
 *               message: Mail del cliente verificado
 *       400:
 *         description: Se envió un token vacío, inválido o la cuenta ya fue verificada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             examples:
 *               token_requerido:
 *                 summary: ✖ Token no recibido
 *                 value:
 *                   error: Token no recibido
 *                   code: TOKEN_REQUIRED
 *               token_inválido:
 *                 summary: ✖ Token con formato inválido
 *                 value:
 *                   error: Formato del token inválido
 *                   code: INVALID_TOKEN_FORMAT
 *               token_expirado_o_ya_verificado:
 *                  summary: ✖ Token ya verificado ó no encontrado en DDBB
 *                  value:
 *                    error: Token expirado o cuenta ya verificada
 *                    code: ALREADY_VERIFIED_OR_EXPIRED_TOKEN
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: Error interno del servidor
 *               code: INTERNAL_SERVER_ERROR
 */

clientsRouter.get('/me/verify/:verification_token', verifyMail);

/**
 * @swagger
 * /clients/login:
 *   post:
 *     summary: (Público) Log in para clientes.
 *     description: Recibimos email y contraseña por body, recibimos un JWToken si las credenciales son correctas.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email del cliente, se usa como usuario para el log in.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña del cliente.
 *           examples:
 *             enviar_datos_correctos:
 *               summary: ✔ Enviamos credenciales correctas
 *               description: Si el mail existe en la base de datos y la contraseña coincide recibiremos como respuesta el token de autenticación con expiración en 7 días.
 *               value:
 *                 email: 123pass123@consultas.com
 *                 password: 123pass123
 *             enviar_datos_erroneos:
 *               summary: ✖ Enviamos credenciales inválidas
 *               description: Si las credenciales no coinciden (mail/contraseña) recibiremos como respuesta un error sin detallar cuál es el dato equivocado, para no exponer datos sensibles y por seguridad.
 *               value:
 *                 email: noExiste@esteMail.com
 *                 password: passwordfalsa123
 *             no_enviar_datos_clave:
 *               summary: ✖ No enviamos un dato clave
 *               description: De no enviar un dato clave, sea el email o la contraseña, recibiremos como respuesta un mensaje detallando el campo faltante.
 *               value:
 *                 email: 123pass123@consultas.com
 *             enviar_datos_con_formato_inválido:
 *               summary: ✖ Enviamos datos con formato inválido
 *               description: De recibir algún dato con formato inválido, recibiremos como respuesta un mensaje detallando el dato con formato incorrecto.
 *               value:
 *                 email: email#gmail.com
 *                 password: 123pass123
 *     responses:
 *       200:
 *         description: Con las credenciales confirmadas, devolvemos el JWToken firmado del cliente con expiración de 7 (siete) días.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQzMGFhMTkwLTQwMzUtMTFmMS04YzI0LWU0ZmQ0NWI0NTY2MiIsImlhdCI6MTc3NzU2NjA4NiwiZXhwIjoxNzc4MTcwODg2fQ.ZDc7V4MbogX0I1QGsNpnlTrssA1zU9qClskEkR-Ne0w
 *       400:
 *         description: No se envió mail, contraseña o tienen un formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             examples:
 *               email_o_password_no_recibidos:
 *                 summary: ✖ Email o Password no recibidos
 *                 value:
 *                   error: Email no recibido || Contraseña no recibida
 *                   code: EMAIL_REQUIRED || PASSWORD_REQUIRED
 *               email_o_password_con_formato_inválido:
 *                 summary: ✖ Email o Password con formato inválido
 *                 value:
 *                   error: Formato del email inválido || Formato de la contraseña inválido
 *                   code: INVALID_EMAIL_FORMAT || INVALID_PASSWORD_FORMAT
 *       401:
 *         description: Email o contraseña incorrectos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               message: Credenciales inválidas
 *               code: INVALID_CREDENTIALS
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: Error interno del servidor
 *               code: INTERNAL_SERVER_ERROR
 */

clientsRouter.post('/login', loginClient);

//Client routes
clientsRouter.use(authMiddleware);

/**
 * @swagger
 * /clients/me:
 *   get:
 *     summary: (Token required) Entrega los datos del usuario logeado.
 *     description: Entrega los datos básicos del usuario logeado utilizando el token de autorización enviado por headers.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve un objeto con los datos básicos de la cuenta logeada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *             example:
 *                 id: 08ed9059-26f3-11f1-bf6b-e4fd45b45662
 *                 business_name: Alpine TECH
 *                 tax_id: 25-930201-3
 *                 email: Alpine@consultas.com
 *                 phone: 0800-666-7171
 *                 address: Constitución 411
 *                 contact_name: Minerva Belen
 *                 contact_phone: 1557483920
 *                 last_login: null
 *                 status: pending
 *                 is_admin: 0
 *       400:
 *         description: Hay problemas con el ID recibido por token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             examples:
 *               id_inexistente:
 *                 summary: ✖ No había ID en el token
 *                 value:
 *                   error: ID no recibido
 *                   code: ID_REQUIRED
 *               id_con_formato_inválido:
 *                 summary: ✖ ID con formato inválido
 *                 value:
 *                   error: Formato del ID inválido
 *                   code: INVALID_ID_FORMAT
 *       401:
 *         description: No se recibió token vía header.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             examples:
 *               no_enviamos_token:
 *                 summary: ✖ No enviamos ningún token
 *                 value:
 *                   error: No se recibió token via header
 *                   code: MISSING_AUTH_HEADER
 *               token_inválido:
 *                 summary: ✖ Token con formato inválido
 *                 value:
 *                   error: Token inválido
 *                   code: JsonWebTokenError
 *               token_expirado:
 *                 summary: ✖ Token expirado
 *                 value:
 *                   error: Token expirado
 *                   code: TokenExpiredError
 *       404:
 *         description: No hay un cliente con ese ID en la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: Cliente no encontrado
 *               code: CLIENT_NOT_FOUND
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *             example:
 *               error: Error interno del servidor
 *               code: INTERNAL_SERVER_ERROR
 */

clientsRouter.get('/me', getMyProfile);

/**
 * @swagger
 * /clients/me:
 *   patch:
 *     summary: Actualiza datos no críticos del cliente.
 *     description: Enviamos por body los datos a cambiar, usamos el id del cliente logeado como punto de referencia.
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/updateClient'
 *           examples:
 *               cambiar_valores_permitidos:
 *                 summary: ✔ Cambiamos valores permitidos.
 *                 value:
 *                   phone: 0800-123-3030
 *                   address: Wallaby 42, Sydney.
 *                   contact_name: P. Sherman
 *                   contact_phone: 1557493021
 *               enviar_valores_mixtos:
 *                 summary: ⚠ Enviamos valores inválidos.
 *                 description: Cualquier valor no permitido será ignorado, mientras la petición tenga un valor válido la actualización tendrá lugar.
 *                 value:
 *                   city: Tigre
 *                   province: Buenos Aires
 *                   country: Argentina
 *                   address: Constitución 911
 *               enviar_solo_valores_inválidos:
 *                 summary: ✖ Enviamos solo valores inválidos.
 *                 description: Enviar solo valores no permitidos para actualización devolverá un mensaje de error.
 *                 value:
 *                   name: Dario F. Gonzalez
 *                   stack: PERN
 *                   experience: 3+ Years
 *                   actual_status: Freelancer
 *                   github: github.com/DarioFGonzalez
 *                   ready_to_work: true
 *               enviar_body_vacío:
 *                 summary: ✖ Enviamos un body vacío.
 *                 description: Enviar un body vacío devolverá un mensaje de error.
 *                 value: {}
 *     responses:
 *       200:
 *         description: Devuelve el registro completo del cliente actualizado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *             example:
 *                 id: 08ed9059-26f3-11f1-bf6b-e4fd45b45662
 *                 business_name: Alpine TECH
 *                 tax_id: 25-930201-3
 *                 email: Alpine@consultas.com
 *                 phone: 0800-123-3030
 *                 address: Wallaby 42, Sydney.
 *                 contact_name: P. Sherman
 *                 contact_phone: 1557493021
 *                 last_login: null
 *                 status: pending
 *                 is_admin: 0
 *       400:
 *         description: No se recibió nada por body o no hay condiciones válidas para actualizar.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               body_vacío:
 *                 summary: ⭕ Body vacío
 *                 value:
 *                   error: No se recibió nada por body
 *                   code: RECEIVED_AN_EMPTY_BODY
 *               sin_condiciones_válidas:
 *                 summary: ⚠ Condiciones inválidas
 *                 value:
 *                   error: Sin condiciones para actualizar
 *                   code: NO_VALID_CONDITIONS_TO_UPDATE
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               no_conseguimos_datos_actualizados:
 *                  summary: ✖ No se pudo traer el cliente actualizado
 *                  value:
 *                    error: No se pudo actualizar el cliente
 *                    code: DATA_CONSISTENCY_ERROR
 *               error_interno_general:
 *                  summary: ✖ Error interno inesperado
 *                  value:
 *                    error: Error interno del servidor
 *                    code: INTERNAL_SERVER_ERROR
 */

clientsRouter.patch('/me', updateMyProfile);

/**
 * @swagger
 * /clients/me/change-password:
 *   patch:
 *     summary: Actualiza la contraseña del cliente logeado.
 *     description: Utiliza el token de seguridad para identificar al cliente. Recibe la contraseña actual y la nueva por body, checkea credenciales y reemplaza la contraseña por la nueva (hasheada) en el registro del cliente.
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *           examples:
 *               enviamos_valores_correctos_A:
 *                 summary: ✔ Enviamos valores correctos. [Ejemplo A]
 *                 value:
 *                   password: admin123
 *                   newPassword: 123admin123
 *               enviamos_valores_correctos_B:
 *                 summary: ✔ Enviamos valores correctos. [Ejemplo B]
 *                 value:
 *                   password: 123admin123
 *                   newPassword: admin123
 *               enviamos_valores_iguales:
 *                 summary: 🔂 Enviamos valores idénticos.
 *                 value:
 *                   password: admin123
 *                   newPassword: admin123
 *               contraseña_actual_incorrecta:
 *                 summary: ✖ Contraseña actual incorrecta.
 *                 value:
 *                   password: administradorTorre3
 *                   newPassword: 123admin123
 *               nueva_contraeseña_con_formato_inválido:
 *                 summary: ✖ Formato inválido para nueva contraseña.
 *                 value:
 *                   password: admin123
 *                   newPassword: 1
 *               falta_algun_dato:
 *                 summary: ✖ Falta algún dato.
 *                 value:
 *                   newPassword: 123admin123
 *                   old_password: admin123
 *     responses:
 *       200:
 *         description: Devuelve un mensaje confirmando la actualización exitosa de la contraseña.
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *             example:
 *                 message: Contraseña actualizada exitosamente
 *       400:
 *         description: Falta algúna contraseña, la nueva tiene un formáto inválido o ambas contraseñas son iguales.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               falta_contraseña:
 *                 summary: ✖ Faltan datos
 *                 value:
 *                   error: No se recibió una contraseña
 *                   code: MISSING_PASSWORD_FIELD
 *               formato_inválido:
 *                 summary: ✖ Contraseña con formato inválido
 *                 value:
 *                   error: Formato de la contraseña inválido
 *                   code: INVALID_PASSWORD_FORMAT
 *               contraseñas_iguales:
 *                  summary: 🔂 Ambas contraseñas son iguales
 *                  value:
 *                    error: La nueva contraseña debe ser diferente de la actual
 *                    code: SAME_PASSWORD_CONFLICT
 *       401:
 *         description: La contraseña enviada es incorrecta, no coincide con la guardada en base de datos a este registro de cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             example:
 *               error: Contraseña incorrecta
 *               code: UNAUTHORIZED_WITHOUT_PASSWORD
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               no_conseguimos_datos_actualizados:
 *                  summary: ✖ No se pudo traer el cliente actualizado
 *                  value:
 *                    error: Error al recuperar el cliente actualizado
 *                    code: DATA_CONSISTENCY_ERROR
 *               error_interno_general:
 *                  summary: ✖ Error interno inesperado
 *                  value:
 *                    error: Error interno del servidor
 *                    code: INTERNAL_SERVER_ERROR
 */

clientsRouter.patch('/me/change-password', changeMyPassword);

clientsRouter.patch('/me/deactivate', deactivateMySelf);
clientsRouter.post('/me/reactivate', sendReactivationMail);
clientsRouter.patch('/me/reactivate/:verification_token', reactivateMyAccount)

//Admin routes
clientsRouter.use(adminOnly);

clientsRouter.get('/all', getAllClients);
clientsRouter.get('/search', getClientsByQuery);

clientsRouter.patch('/:id/toggle', toggleClient);
clientsRouter.patch('/:id/toggle-admin', toggleAdmin);

clientsRouter.get('/:id', getClientById);

module.exports = clientsRouter;