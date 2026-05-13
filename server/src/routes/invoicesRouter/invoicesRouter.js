const {Router} = require('express');
const invoicesRouter = Router();
const postInvoice = require('../../handlers/invoiceHandlers/postInvoice');
const { getAllInvoices, getInvoiceById, getInvoicesByQuery } = require('../../handlers/invoiceHandlers/getInvoices');
const { updateInvoice } = require('../../handlers/invoiceHandlers/updateInvoice');
const confirmInvoice = require('../../handlers/invoiceHandlers/confirmInvoice');
const deliverInvoice = require('../../handlers/invoiceHandlers/deliverInvoice');
const payInvoice = require('../../handlers/invoiceHandlers/payInvoice');
const cancelInvoice = require('../../handlers/invoiceHandlers/cancelInvoice');
const authMiddleware = require('../../middlewares/auth');
const { activeClientOnly, adminOnly } = require('../../middlewares/adminOnly');
const { getMyInvoices, getThisInvoice, getMyActiveInvoice } = require('../../handlers/invoiceHandlers/getMyInvoices');

//Client routes
invoicesRouter.use(authMiddleware);

//Only active clients
invoicesRouter.use(activeClientOnly);

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: (👤) Crear un nuevo registro de factura.
 *     description: Crea una nueva factura en estado "Draft" a nombre del cliente que logeado. Recibe por body el id del primer producto y la cantidad del mismo a agregar. 
 *     tags:
 *       - Invoices
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 min: 1
 *           examples:
 *               enviamos_datos_válidos:
 *                 summary: ✔ Enviamos datos válidos.
 *                 description: Enviamos ID del producto y la cantidad a agregar en la factura.
 *                 value:
 *                   product_id: e7b50924-49b0-11f1-acdd-507b9d97da6f 
 *                   quantity: 4
 *               enviar_datos_extra:
 *                 summary: ⚠ Todo dato extra/inválido será ignorado.
 *                 description: En caso de recibir datos extra estos serán ignorados y se creará el registro con los datos obligatorios.
 *                 value:
 *                   product_id: e7b5f3e4-49b0-11f1-acdd-507b9d97da6f
 *                   quantity: 1
 *                   paid: true
 *                   total: 175.55
 *               falta_dato_obligatorio:
 *                 summary: ✖ No enviamos todos los datos necesarios.
 *                 description: En caso de no recibir un dato clave, recibiremos un error detallando el campo faltante.
 *                 value:
 *                   product_id: e7b49539-49b0-11f1-acdd-507b9d97da6f
 *               producto_inexistente:
 *                 summary: ✖ Enviamos un producto que no existe.
 *                 description: Si enviamos un ID que no le pertenece a ningún producto en DDBB, recibiremos un error como respuesta.
 *                 value:
 *                   product_id: g7b49539-49b0-11f1-acdd-507b9d97da6f
 *                   quantity: 10
 *               cantidad_inválida:
 *                 summary: ✖ Enviamos cantidad inválida.
 *                 description: Si enviamos una cantidad menor o igual a cero, recibiremos un error como respuesta.
 *                 value:
 *                   product_id: e7b49539-49b0-11f1-acdd-507b9d97da6f
 *                   quantity: -10
 *     responses:
 *       201:
 *         description: |
 *           ### ✅ Factura creada con éxito
 *           La factura se crea exitosamente en estado 'Draft'. Recibimos el ID de la factura recién creada como respuesta.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoiceId:
 *                   type: string
 *             example:
 *               invoiceId: cccccccc-cccc-cccc-cccc-cccccccccccc
 *       400:
 *         description: ID del producto/cantidad faltante o con formato inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               id_no_recibidos:
 *                 summary: ✖ ID no recibido
 *                 value:
 *                   error: ID no recibido
 *                   code: ID_REQUIRED
 *               id_con_formato_inválido:
 *                 summary: ✖ ID con formato inválido
 *                 value:
 *                   error: Formato del ID inválido
 *                   code: INVALID_ID_FORMAT
 *               cantidad_inválida_o_no_recibida:
 *                  summary: ✖ Cantidad inválida
 *                  value:
 *                    error: La cantidad debe ser mayor que cero
 *                    code: INVALID_QUANTITY
 *       404:
 *         description: No se encontró un producto con esa ID en la base de datos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             example:
 *               error: Producto no encontrado
 *               code: PRODUCT_NOT_FOUND
 *       409:
 *         description: Ya existe una factura activa o el producto no cuenta con stock suficiente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 code:
 *                   type: string
 *                 details:
 *                   type: string
 *             examples:
 *               ya_existe_un_draft:
 *                 summary: El cliente ya tiene una factura activa
 *                 value:
 *                   error: El cliente ya tiene un invoice activo
 *                   code: DRAFT_ALREADY_EXISTS
 *                   details: ID del Invoice existente cccccccc-cccc-cccc-cccc-cccccccccccc
 *               sin_stock_suficiente:
 *                 summary: Producto sin stock suficiente
 *                 value:
 *                   error: No hay suficiente stock del producto seleccionado
 *                   code: INSUFFICIENT_STOCK
 *                   details: El producto id 123123 tiene stock real de 10 y necesitamos 15
 *       500:
 *         description: Error interno o inconsistencia de datos del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/errorMessage'
 *             examples:
 *               no_se_pudo_recuperar_la_factura_creada:
 *                  summary: ✖ No se pudo traer la nueva factura de DDBB
 *                  value:
 *                    error: Error al recuperar la factura creada
 *                    code: DATA_CONSISTENCY_ERROR
 *               no_se_pudo_crear_la_relacional:
 *                  summary: ✖ Error al crear la relacional
 *                  value:
 *                    error: Error al crear la relacional
 *                    code: DATA_CONSISTENCY_ERROR
 *               error_interno_general:
 *                  summary: ✖ Error interno inesperado
 *                  value:
 *                    error: Error interno del servidor
 *                    code: INTERNAL_SERVER_ERROR
 */

invoicesRouter.post('/', postInvoice);

invoicesRouter.get('/me', getMyInvoices);
invoicesRouter.get('/me/active', getMyActiveInvoice);
invoicesRouter.get('/me/:invoiceId', getThisInvoice);

invoicesRouter.patch('/:id', updateInvoice);
invoicesRouter.post('/:id/confirm', confirmInvoice);
invoicesRouter.post('/:id/cancel', cancelInvoice);

//Admin routes
invoicesRouter.use(adminOnly);

invoicesRouter.get('/all', getAllInvoices);
invoicesRouter.get('/search', getInvoicesByQuery);
invoicesRouter.get('/:id', getInvoiceById);
invoicesRouter.post('/:id/deliver', deliverInvoice);

//Webhook
invoicesRouter.post('/:id/paid', payInvoice);

module.exports = invoicesRouter;