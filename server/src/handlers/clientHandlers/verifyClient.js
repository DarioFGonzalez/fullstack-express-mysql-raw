const validation = require('../../utils/validations');

const verifyMail = async (req, res) => {
    try {
        const { verification_token } = req.params;
        if(!validation.isValidToken(verification_token))
        {
            throw Object.assign( new Error ('Formato del token no válido'),
            {
                status: 400,
                code: 'INVALID_TOKEN_FORMAT',
                timestamp: new Date().toISOString()
            } );
        }
    
        const [result] = await req.pool.query( 'UPDATE clients SET status = "confirmed", email_verified_at = NOW(), verification_token = NULL WHERE verification_token = ? AND status = "pending"', [verification_token] );
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

module.exports = verifyMail;