const { isValidUUID, isValidPassword } = require('../../utils/validations');
const queryBuilder = require('../../utils/queryBuilder');
const bcrypt = require('bcrypt');

const updateClient = async(req, res) =>
{
    try {
        const { conditions, values } = queryBuilder(req.body);

        if(conditions.length===0)
        {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        if(!isValidUUID(req.params.id))
        {
            throw Object.assign( new Error('ID Inválido',
                {
                    status: 400,
                    code: "INVALID_ID_FORMAT",
                    timestamp: new Date().toISOString()
                } ) );
        }

        values.push(req.params.id);
        const query = `UPDATE clients SET ${conditions.join(', ')} WHERE id = ?`;

        const [result] = await req.pool.query( query, values );

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            } );
        }

        const selectedFields = 'id, is_active, business_name, tax_id, email, phone, address, contact_name, contact_phone, created_at, updated_at, last_login, verified_at';
        const [rows] = await req.pool.query( `SELECT ${selectedFields} FROM clients WHERE id = ?`, [req.params.id] );

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error en updateClient: ', error.code || error);
        return res.status(error.status || 500).json( {error: error.message} );
    }
}

const updatePassword = async (req, res) =>
{
    try {
        const { id } = req.params;
        const {password, newPassword} = req.body;

        if(!password || !newPassword)
        {
            throw Object.assign( new Error( 'Faltan datos requeridos'),
            {
                status: 400,
                code: 'MISSING_PASSWORD_FIELDS',
                timestamp: new Date().toISOString()
            })
        }

        if(!isValidPassword(newPassword))
        {
            throw Object.assign( new Error('Formato de la nueva contraseña inválido'),
            {
                status: 400,
                code: 'INVALID_NEW_PASSWORD_FORMAT',
                timestamp: new Date().toISOString()
            } );
        }

        const [rows] = await req.pool.query('SELECT password FROM clients WHERE id = ?', [id]);

        if(rows.length===0)
        {
            throw Object.assign( new Error('Cliente con esa ID no encontrado'),
            {
                status: 404,
                code: "CLIENT_NOT_FOUND",
                timestamp: new Date().toISOString()
            } );
        }

        const isSamePassword = await bcrypt.compare(newPassword, rows[0].password);

        if(isSamePassword)
        {
            throw Object.assign( new Error('La nueva contraseña debe ser diferente de la actual'),
            {
                status: 400,
                code: "SAME_PASSWORD_CONFLICT",
                timestamp: new Date().toISOString()
            })
        }

        const isValid = await bcrypt.compare(password, rows[0].password);

        if(!isValid)
        {
            throw Object.assign( new Error('Contraseña incorrecta'),
            {
                status: 401,
                code: "UNAUTHORIZED_WITHOUT_PASSWORD",
                timestamp: new Date().toISOString()
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await req.pool.query('UPDATE clients SET password = ? WHERE id = ?', [hashedPassword, id]);

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('No se pudo actualizar la contraseña'),
            {
                status: 500,
                code: 'UPDATE_FAILED',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json( { message: 'Contraseña actualizada exitosamente' } );
    } catch(error) {
        console.error( 'Error en updatePassword:', error.code || error );
        return res.status(error.status || 500).json( { error: error.message || error } );
    }
}

const toggleClient = async (req, res) =>
{

}

module.exports = { updateClient, updatePassword, toggleClient };