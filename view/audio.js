const express = require('express')
const audioController = require('../controller/audioController')
const {uploadAudio, checkUserAudioDirectory} = require('../controller/audioHelpers')
const verifyJWT = require('../middleware/verifyJWT')

var api = express.Router()

api.get('/public/metadata/:id/:page', audioController.getUserPublicAudioMetadata)
api.get('/public/:id/:file', audioController.getPublicAudio)

api.use(verifyJWT)
api.get('/private/metadata/:id/:page', audioController.getUserPrivateAudioMetadata)
api.get('/private/:id/:file', audioController.getPrivateAudio)
api.post('/add', checkUserAudioDirectory, uploadAudio.single('audioFile'), audioController.uploadAudio)
api.put('/update/:id', audioController.updateAudio)
api.delete('/delete/:id', audioController.deleteAudio)

module.exports = api