const jwt = require('jsonwebtoken')
const config = require('../config/config')
const db = require('../model/sequelize')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')) {
        return res.sendStatus(401)
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        config.ACCESS_TOKEN_SECRET,
        async(e, decoded) => {
            if(e) {
                return res.sendStatus(403)
            }

            try {
                req.user = await db.User.findOne({
                    where: {'id': decoded.id}
                })
            } catch(e) {
                return res.sendStatus(500)
            }

            next()
        }
    )
}

module.exports = verifyJWT