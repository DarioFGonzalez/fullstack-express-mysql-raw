const isValidUUID = require('../../services/uuidvalidator');

const getUsers = async (req, res) => {
    try {
        const {username} = req.query;
        if(username)
        {
            const [rows] = await req.pool.query('SELECT * FROM users WHERE username = ?', [username]);
            if(rows.length===0)
            {
                throw Object.assign(
                    new Error('Usuario con ese username no encontrado en la base de datos',
                        {
                            status: 404,
                            code: 'USERNAME_NOT_FOUND',
                            timestamp: new Date().toISOString()
                        } ) );
            }

            return res.status(200).json(rows);
        }

        const [rows] = await req.pool.query("SELECT * FROM users");
        if(rows.length===0)
        {
            throw Object.assign(
                new Error('Base de datos sin usuarios cargados',
                    {
                        status: 404,
                        code: 'NO_USERS_FOUND',
                        timestamp: new Date().toISOString()
                    } ) );
        }

        return res.status(200).json(rows);
    }
    catch(error) {
        console.error('Error en /users:', error.code);
        res.status(error.status).json( { error: error.message } );
    }
};

const getUserById = async (req, res) => {
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

        const [rows] = await req.pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if(rows.length===0)
        {
            throw Object.assign(
                new Error('Usuario con esa ID no encontrado en la base de datos'),
                {
                    status: 404,
                    code: "USER_ID_NOT_FOUND",
                    timestamp: new Date().toISOString()
                });
        }

        res.status(200).json(rows);
    } catch(error) {
        console.error('Error en /users/:id:', error);
        res.status(500).json( { error: 'Error al traer el usuario por id' } );
    }
};

module.exports = { getUsers, getUserById };