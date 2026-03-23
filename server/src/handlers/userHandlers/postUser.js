const postUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password)
        {
            throw Object.assign( new Error('Falta información necesaria para crear el usuario',
                {
                    status: 400,
                    code: "MISSING_PASSWORD_OR_USERNAME",
                    timestamp: new Date().toISOString()
                }
            ));
        }

        const [result] = await req.pool.query( 'INSERT INTO users (username, password) VALUES (?, ?)', [username, password] );
        
        const [rows] = await req.pool.query( 'SELECT * FROM users WHERE id = ?',[result.insertId] );

        return res.status(201).json( rows[0] );
    } catch(error) {

        console.error('Error creando usuario:', error.code);

        if(error.code==='ER_DUP_ENTRY') return res.status(409).json( { error: 'El usuario ya existe' } );

        return res.status(error.status).json( { error: error.message } );
    }
}

module.exports = { postUser };