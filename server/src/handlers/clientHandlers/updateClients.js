const validation = require('../../utils/validations');
const { updateClientBuilder } = require('../../utils/queryBuilder');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const createError = require('../../utils/errorBuilder');

const updateMyProfile = async (req, res) =>
{
    try {
        const { conditionsQuery, values } = updateClientBuilder(req.body);

        validation.validateId(req.client.id);

        values.push(req.client.id);
        
        const updateQuery = `UPDATE clients SET ${conditionsQuery} WHERE id = ?`;

        const [result] = await req.pool.query( updateQuery, values );

        if(result.affectedRows===0) {
            throw createError('Cliente no encontrado', 404, 'CLIENT_NOT_FOUND');
        }

        const [rows] = await req.pool.query( `SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [req.client.id] );

        return res.status(200).json(rows[0]);
    } catch(error) {
        console.error('Error actualizando cliente:', error.code || error);
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

        validation.validatePassword(newPassword);

        const [rows] = await req.pool.query('SELECT password FROM clients WHERE id = ?', [id]);

        if(rows.length===0)
        {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: "CLIENT_NOT_FOUND",
                timestamp: new Date().toISOString()
            } );
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
            confirmed: `"active", verification_token = NULL`,
            inactive: `"active", verification_token = NULL`
        }

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

const toggleAdmin = async (req, res) => {
    const {id} = req.params;
    
    try {
        validation.validateId(id);

        if(id===req.client.id) {
            throw Object.assign( new Error('No puede auto-quitarse los privilegios'),
            {
                status: 403,
                code: 'CANNOT_TOGGLE_OWN_PRIVILEGES',
                timestamp: new Date().toISOString()
            })
        }

        const [rows] = await req.pool.query('SELECT is_admin FROM clients WHERE id = ?', [id]);
        if(rows.length===0) {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: "CLIENT_NOT_FOUND",
                timestamp: new Date().toISOString()
            })
        }

        const new_privilege = rows[0].is_admin===1 ? 0 : 1;

        await req.pool.query('UPDATE clients SET is_admin = ? WHERE id = ?', [new_privilege, id]);

        return res.status(200).json( {message: 'Privilegios del cliente actualizados', new_privilege} );
    } catch(error) {
        console.error( "Error en toggleAdmin:", error.code || error);
        return res.status(error.status||500).json( { error: error.message || error } );
    }
}

module.exports = { updateMyProfile, changeMyPassword, deactivateMySelf, toggleClient, toggleAdmin };