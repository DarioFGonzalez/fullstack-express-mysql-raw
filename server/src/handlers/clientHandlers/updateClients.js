const validation = require('../../utils/validations');
const { updateQueryBuilder } = require('../../utils/queryBuilder');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const updateMyProfile = async (req, res) =>
{
    try {
        const { conditions, values } = updateQueryBuilder(req.body);

        if(conditions.length===0)
        {
            throw Object.assign( new Error('Sin condiciones para actualizar'),
            {
                status: 400,
                code: 'NO_CONDITIONS_TO_UPDATE',
                timestamp: new Date().toISOString()
            })
        }

        validation.validateId(req.client.id);

        values.push(req.client.id);
        
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

        const [rows] = await req.pool.query( `SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [req.params.id] );

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error en updateClient: ', error.code || error);
        return res.status(error.status || 500).json( {error: error.message} );
    }
}

const changeMyPassword = async (req, res) =>
{
    try {
        const { id } = req.client;
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

        if(!validation.isValidPassword(newPassword))
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

const deactivateMySelf = async (req, res) =>
{
    try {
        const {id} = req.client;
        validation.validateId(id);
        if(req.client.status!=='active') {
            throw Object.assign( new Error('El cliente no está activo'),
            {
                status: 403,
                code: 'FORBIDDEN_ACCOUNT_NOT_ACTIVE',
                timestamp: new Date().toISOString()
            })
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const deactivationQuery =
        `UPDATE clients
        SET
            status = "inactive",
            verification_token = ?
        WHERE id = ?`;

        const values = [ verificationToken, id ];

        const [result] = await req.pool.query( deactivationQuery, values );

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        res.status(200).json( { message: 'Estado del cliente actualizado' } );
        } catch(error) {
        console.error( 'Error desactivando cliente:', error.code || error );
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

const toggleClient = async (req, res) =>
{
    try {
        const {id} = req.params;
        validation.validateId(id);

        const [actualStatus] = await req.pool.query('SELECT status FROM clients WHERE id = ?', [id]);
        if(actualStatus.length===0) {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        const {status} = actualStatus[0];

        let values = [ id ];
        if(status==='active') {
            values.unshift(crypto.randomBytes(32).toString('hex'));
        }

        const statusList = {
            active: `"inactive", verification_token = ?`,
            confirmed: `"active", verifcation_token = NULL`,
            inactive: `"active", verification_token = NULL`
        }

        console.log("status: ", status, "\nstatusList[status]: ", statusList[status]);

        if(!statusList[status]) {
            throw Object.assign( new Error('Status actual no intercambiable'),
            {
                status: 400,
                code: "INVALID_ACTUAL_STATUS",
                timestamp: new Date().toISOString()
            })
        }

        const toggleQuery =
        `UPDATE clients
        SET
            status = ${statusList[status]}
        WHERE id = ?`;

        console.log("toggleQuery: ", toggleQuery);

        const [result] = await req.pool.query( toggleQuery, values );

        if(result.affectedRows===0)
        {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        res.status(200).json( { message: 'Estado del cliente actualizado' } );
        } catch(error) {
        console.error( 'Error cambiando el estado del cliente:', error.code || error );
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = { updateMyProfile, changeMyPassword, deactivateMySelf, toggleClient };