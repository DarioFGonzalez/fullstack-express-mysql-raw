const validation = require("../../utils/validations");

const getMyProfile = async (req, res) => {
    const { id } = req.client;
    validation.validateId(id);

    try {
        const [userInfo] = await req.pool.query(`SELECT ${validation.selectedFields} FROM clients WHERE id = ?`, [id]);
        if(userInfo.length === 0) {
            throw Object.assign( new Error('Cliente no encontrado'),
            {
                status: 404,
                code: 'CLIENT_NOT_FOUND',
                timestamp: new Date().toISOString()
            })
        }

        return res.status(200).json(userInfo[0]);
    } catch(error) {
        console.error("Error trayendo perfíl del cliente:", error.code||error);
        return res.status(error.status||500).json( {error: error.message||error} );
    }
}

module.exports = getMyProfile;