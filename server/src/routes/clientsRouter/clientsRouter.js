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
 *             type: object
 *             required:
 *               - business_name
 *               - tax_id
 *               - email
 *               - password
 *             properties:
 *               business_name:
 *                 type: string
 *                 description: Razón social completa o nombre comercial legalmente registrado de la empresa cliente.
 *               tax_id:
 *                 type: string
 *                 description: Identificador fiscal único de la entidad (ej CUIT/RUT). Se utiliza para la validación de identidad y facturación.
 *               email:
 *                 type: string
 *                 description: Dirección de correo electrónico institucional. Actúa como identificador de acceso y canal principal de notificaciones legales.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Contraseña de acceso al sistema. Debe ser almacenada mediante hashing y cumplir con políticas de seguridad.
 *               phone:
 *                 type: string 
 *                 description: Línea telefónica principal de contacto de la organización.
 *               address:
 *                 type: string
 *                 description: Domicilio fiscal o dirección de contacto de la organización.
 *               contact_name:
 *                 type: string
 *                 description: Nombre y apellido de la persona de contacto designada o representante administrativo.
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
 *                 summary: ⚠ Todo dato extra será ignorado.
 *                 description: En caso de recibir datos extra estos serán ignorados y se creará el registro con los datos mandatorios.
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
 *                 description: En caso de no recibir datos clave, recibiremos un error detallando los campos faltantes.<br><br>`ERROR(400) "Faltan campos obligatorios {datos faltantes}""`
 *                 value:
 *                   business_name: Salvation 300 & Cia.
 *                   tax_id: 19-32199123-2
 *                   email: salvation300@consultas.com
 *                   phone: 47669283
 *                   address: Gral Espejo 421
 *     responses:
 *       201:
 *         description: Registro de cliente creado exitosamente, se devuelven los datos recién creados.
 *       400:
 *         description: Se envió un body vacío, faltan campos obligatorios o se enviaron valores con formato inválido.<br><br>`400(MISSING_REQUIRED_FIELDS) "Faltan campos obligatorios {campos faltantes}"`<br><br>`400(INVALID_X_FORMAT) "Formato del {X} inválido"`<br><br>`400(X_REQUIRED) "{X} no recibido"`
 *       409:
 *         description: Ya existe un registro con valor clave idéntico.<br><br>`409(ER_DUP_ENTRY) "El cliente ya existe"`
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 */

clientsRouter.post('/', postClient);

/**
 * @swagger
 * /clients/me/verify/{verification_token}:
 *   get:
 *     summary: (Público) Confirmamos el mail del cliente.
 *     description: Si el token coincide con el del cliente y la cuenta está en estado 'pendiente', la actualizamos a 'confirmada' y borramos el token.
 *     tags:
 *       - Clients
 *     parameters:
 *      - in: path
 *        name: verification_token
 *        required: true
 *        schema:
 *          type: string
 *          example: 7eff170bf6872bff6ce8d4af1c97114aa890da7fa4449554d0378d076906bec1
 *        description: Token único de verificación del cliente. (32 caracteres hex)<br>Casos de prueba:<br><br>- Token válido    (Simulado)          ->  `7eff170bf6872bff6ce8d4af1c97114aa890da7fa4449554d0378d076906bec1`<br><br>- Error 401       (Formato inválido)  ->  `invalid-token-123`<br><br>- Error 400       (Requerido)         ->  ` `
 *     responses:
 *       201:
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
 *               code: ERR_DUP_ENTRY
 *               message: El cliente ya existe
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 */

clientsRouter.get('/me/verify/:verification_token', verifyMail);

clientsRouter.post('/login', loginClient);

//Client routes
clientsRouter.use(authMiddleware);

clientsRouter.get('/me', getMyProfile);
clientsRouter.patch('/me', updateMyProfile);
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