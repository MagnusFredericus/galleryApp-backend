const express = require('express')
const videoController = require('../controller/videoController')
const {uploadVideo, checkUserVideoDirectory} = require('../controller/videoHelpers')
const verifyJWT = require('../middleware/verifyJWT')

var api = express.Router()

api.get('/public/metadata/:id/:page', videoController.getUserPublicVideoMetadata)
api.get('/public/thumbnails/:id/:file', videoController.getThumbnailPublicVideo)
api.get('/public/:id/:file', videoController.getPublicVideo)

api.use(verifyJWT)
api.get('/private/metadata/:id/:page', videoController.getUserPrivateVideoMetadata)
api.get('/private/thumbnails/:id/:file', videoController.getThumbnailPrivateVideo)
api.get('/private/:id/:file', videoController.getPrivateVideo)
api.post('/add', checkUserVideoDirectory, uploadVideo.single('videoFile'), videoController.uploadVideo)
api.put('/update/:id', videoController.updateVideo)
api.delete('/delete/:id', videoController.deleteVideo)

module.exports = api