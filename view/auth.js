const express = require('express')
const authControllers = require('../controller/authController')

const api = express.Router()

api.post('/register', authControllers.register)
api.post('/login', authControllers.login)

module.exports = api