const validation = require('../../utils/validations');

const verifyClient = async (req, res) => {
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
    
        const [result] = await req.pool.query( 'UPDATE clients SET is_active = true, verified_at = NOW(), verification_token = NULL WHERE verification_token = ? AND is_active = false', [verification_token] );
        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Token expirado  o cuenta ya verificada'),
            {
                status: 400,
                code: 'ALREADY_VERIFIED_OR_EXPIRED_TOKEN',
                timestamp: new Date().toISOString()
            } );
        }

        return res.status(200).json( { success: 'Cliente dado de alta' } );
    } catch(error) {
        console.error('Error en /clients/verify: ', error);
        return res.status(error.status || 500).json( error );
    }
}

module.exports = verifyClient;