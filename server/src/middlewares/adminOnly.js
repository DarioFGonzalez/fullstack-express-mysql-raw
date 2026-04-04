const adminOnly = (req, res, next) => {
    if(!req.user?.is_admin) {
        throw Object.assign( new Error('No autorizado'),
        {
            status: 403,
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        })
    }

    next();
}

module.exports = adminOnly;