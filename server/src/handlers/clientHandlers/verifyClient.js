const validation = require('../../utils/validations');

const verifyMail = async (req, res) => {
    try {
        const { verification_token } = req.params;
        validation.validateToken(verification_token);

        const verificationQuery =
        `UPDATE clients
        SET
            status = "confirmed",
            email_verified_at = CURRENT_TIMESTAMP,
            verification_token = NULL
        WHERE verification_token = ? AND status = "pending"`
    
        const [result] = await req.pool.query( verificationQuery, [verification_token] );
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Token expirado  o cuenta ya verificada'),
            {
                status: 400,
                code: 'ALREADY_VERIFIED_OR_EXPIRED_TOKEN',
                timestamp: new Date().toISOString()
            } );
        }

        return res.status(200).json( { success: 'Mail del cliente verificado' } );
    } catch(error) {
        console.error('Error en /clients/verifyMail: ', error);
        return res.status(error.status || 500).json( error );
    }
}

const sendReactivationMail = async (req, res) => {
    const { id } = req.client;
    validation.validateId(id);

    try {
        const [rows] = await req.pool.query('SELECT verification_token FROM clients WHERE id = ?', [id]);
        if(rows.length===0) {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const token = rows[0].verification_token;

        //Acá vendría la parte donde usamos NodeMailer para crear el HTML y enviar el correo con el botón de reactivación.
        console.log(`Link de reactivación: https://midominio.com/reactivate/${token}`);

        return res.status(200).json( {message: 'Mail de reactivación enviado'} );
    } catch(error) {
        console.error("Error enviando mail de reactivación:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const reactivateMyAccount = async (req, res) => {
    try {
        const { verification_token } = req.params;
        validation.validateToken(verification_token);

        if(req.client.status!=='inactive') {
            throw Object.assign( new Error('El cliente no está inactivo'),
            {
                status: 403,
                code: 'FORBIDDEN_ACCOUNT_ACTIVE',
                timestamp: new Date().toISOString()
            })
        }

        const verificationQuery =
        `UPDATE clients
        SET
            status = "active",
            verification_token = NULL
        WHERE verification_token = ? AND status = "inactive"`
    
        const [result] = await req.pool.query( verificationQuery, [verification_token] );
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Token expirado o cuenta activa.'),
            {
                status: 400,
                code: 'ALREADY_ACTIVE_OR_EXPIRED_TOKEN',
                timestamp: new Date().toISOString()
            } );
        }

        return res.status(200).json( { success: 'Cliente activado' } );
    } catch(error) {
        console.error('Error en /client/reactivateMySelf:', error.code||error);
        return res.status(error.status || 500).json( {error: error.message||error} );
    }
}

module.exports = {verifyMail, sendReactivationMail, reactivateMyAccount};