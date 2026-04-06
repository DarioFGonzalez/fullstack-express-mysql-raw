const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            throw Object.assign( new Error('No se recibió token via header'),
            {
                status: 401,
                code: "MISSING_AUTH_HEADER",
                timestamp: new Date().toISOString()
            })
        }

        const token = authHeader.split(' ')[1];
        if(!token) {
            throw Object.assign( new Error('No se recibió token via header'),
            {
                status: 401,
                code: "MISSING_AUTH_HEADER",
                timestamp: new Date().toISOString()
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.client = decoded;
        next();
    } catch(error) {
        console.error("Error en el middleware de autenticación:", error.code||error);
        if(error.name==='JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if(error.name==='TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        return res.status(401).json({ error: 'No autorizado' });
    }
}

module.exports = authMiddleware;