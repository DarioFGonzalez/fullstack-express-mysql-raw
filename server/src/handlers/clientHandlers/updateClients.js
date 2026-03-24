const { isValidUUID } = require('../../utils/validations');
const queryBuilder = require('../../utils/queryBuilder');

const updateClient = async(req, res) =>
{
    try {
        const { conditions, values } = queryBuilder(req.body);

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

}

const toggleClient = async (req, res) =>
{

}

module.exports = { updateClient, updatePassword, toggleClient };