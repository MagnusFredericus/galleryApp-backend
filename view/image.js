const express = require('express')
const imageController = require('../controller/imageController')
const {uploadImage, checkUserImageDirectory} = require('../controller/imageHelpers')
const verifyJWT = require('../middleware/verifyJWT')

var api = express.Router()

api.get('/public/metadata/:id/:page', imageController.getUserPublicImageMetadata)
api.get('/public/thumbnails/:id/:file', imageController.getThumbnailPublicImage)
api.get('/public/:id/:file', imageController.getPublicImage)

api.use(verifyJWT)
api.get('/private/metadata/:id/:page', imageController.getUserPrivateImageMetadata)
api.get('/private/thumbnails/:id/:file', imageController.getThumbnailPrivateImage)
api.get('/private/:id/:file', imageController.getPrivateImage)
api.post('/add', checkUserImageDirectory, uploadImage.single('imageFile'),imageController.uploadImage)
api.put('/update/:id', imageController.updateImage)
api.delete('/delete/:id', imageController.deleteImage)

module.exports = api