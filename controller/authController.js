const jwt = require('jsonwebtoken')
const config = require('../config/config')
const db = require('../model/sequelize')

const register = async(req, res) => {
    const { email, password } = req.body
    
    if(!email) {
        return res.status(400).json({'message':'Email required'})
    }
    if(!password) {
        return res.status(400).json({'message':'Password required'})
    }

    try {
        let duplicate = db.User.findOne({
            where: {'email':email}
        })
        if(duplicate instanceof db.User) {
            return res.status(409).json({'message':'Email not available'})
        }
    } catch(e) {
        console.log(e)
        return res.sendStatus(500)
    }

    try {
        let user = await db.User.create({
            'email':email,
            'password':password
        })
        if(user instanceof db.User) {
            return res.status(201).json({'message': 'user registered'})
        }
    } catch(e) {
        console.log(e)
        return res.sendStatus(500)
    }
}

const login = async(req, res) => {
    const { email, password } = req.body

    if(!email) {
        return res.status(400).json({'message':'Email required'})
    }
    if(!password) {
        return res.status(400).json({'message':'Password required'})
    }

    let user = {}
    try {
        user = await db.User.findOne({
            where: {'email':email}
        })
        if(!(user instanceof db.User)) {
            return res.status(404).json({
                'message':'User email not found'
            })
        }
    } catch(e) {
        res.sendStatus(500)
    }

    let match = false
    try {
        match = await user.checkPassword(password)
    } catch(e) {
        return res.sendStatus(500)
    }

    if(match) {
        const accessToken = jwt.sign(
            {'id':user.id},
            config.ACCESS_TOKEN_SECRET,
            {expiresIn: config.ACCESS_TOKEN_EXPIRES_IN}
        )

        res.status(200).json({accessToken})
    } else {
        return res.status(401).json({'message':Unauthorize})
    }
}

module.exports = {
    register,
    login
}