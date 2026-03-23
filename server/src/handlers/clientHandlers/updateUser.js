const isValidUUID = require('../../services/uuidvalidator');

const updateUser = async(req, res) =>
{
    try {
        const { id } = req.params;
        if(!isValidUUID(id))
        {
            throw Object.assign( new Error('ID Inválido',
                {
                    status: 400,
                    code: "INVALID_ID_FORMAT",
                    timestamp: new Date().toISIString()
                } ) );
        }

        const [rows] = await req.pool.query('SELECT * FROM users WHERE id = ?', [id] );
        if(!rows[0])
        {
            throw Object.assign( new Error('Usuario con ese ID no encontrado',
                {
                    status: 404,
                    code: "USER_NOT_FOUND",
                    timestamp: new Date().toISOString()
                } ) );
        }

        const [result] = await req.pool.query('')

    } catch(error) {
        console.error('Error en updateUser: ', error.code);
        return res.status(error.status).json( {error: error.message} );
    }
}

module.exports = { updateUser };