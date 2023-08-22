const path = require('path')
const fs = require('fs')
const db = require('../model/sequelize')
const sharp = require('sharp')

const getUserPublicImageMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page

    try {
        const result = await db.Image.getUserImageMetadata(userId, page, 'public')
        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }    
    } catch(e) {
        next(e)
    }
}

const getUserPrivateImageMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page

    try {
        const result = await db.Image.getUserImageMetadata(userId, page, 'private')
        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }
    } catch(e) {
        next(e)
    }
}

const getThumbnailPublicImage = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'public', 'images', 'thumbnails')
    }

    return res.sendFile(fileName, options)
}

const getPublicImage = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'public', 'images')
    }

    return res.sendFile(fileName, options)
}

const getThumbnailPrivateImage = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'private', 'images', 'thumbnails')
    }

    if(parseInt(userId) === req.user.id) {
        return res.sendFile(fileName, options)
    } else {
        return res.status(403).json({'message':'forbidden'})
    }
}

const getPrivateImage = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'private', 'images')
    }

    if(parseInt(userId) === req.user.id) {
        return res.sendFile(fileName, options)
    } else {
        return res.status(403).json({'message':'forbidden'})
    }
}

const uploadImage = async(req, res, next) => {
    if(req.file) {
        const originalPath = req.file.path
        const array = String(req.file.path).split('/')
        const fileName = array.pop().split('.')[0]
        const basePath = array.join('/')
    
        req.file.mimetype = 'image/webp'
        req.file.filename = `${fileName}.webp`
        req.file.path = `${basePath}/${fileName}.webp`
    
        try {
            
            //save metadata on db
            await db.Image.saveMetadata(req.user, req.file, req.body)
    
            //create thumbnail
            await sharp(originalPath)
            .resize({
                fit: 'inside',
                width: 200,
                height: 200
            })
            .toFormat('webp')
            .toFile(`${basePath}/thumbnails/${fileName}.webp`)
    
            //change image format
            await sharp(originalPath)
            .toFormat('webp')
            .toFile(`${basePath}/${fileName}.webp`)
    
            //delete original file
            fs.unlinkSync(originalPath)
                
            return res.status(200).json({'message': 'image saved'})
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(204).json({'message':'file format not allowed'})
    }
    
}

const updateImage = async(req, res, next) => {
    const userId = req.user.id
    const id = req.params.id
    const title = req.body.title
    const description = req.body.description
    const privacy = req.body.privacy

    data = {}
    data.userId = userId
    if(title) data.title = title
    if(description) data.description = description
    if(privacy) data.privacy = privacy

    let image = {}
    try {
        image = await db.Image.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }

    if(image instanceof db.Image && image.user_id === parseInt(userId)) {
        try {
            image = await image.updateImage(data)
            imageJSON = await image.toJSON()
            return res.status(200).json(imageJSON)
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(400).json({'message':'image not found'})
    }
}

const deleteImage = async(req, res, next) => {
    const userId = req.user.id
    const id = req.params.id

    let image = {}
    try {
        image = await db.Image.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }
    
    if(image instanceof db.Image && image.user_id === parseInt(userId)) {
        try {
            await image.deleteImage(userId)
            return res.status(200).json({'message':'deleted'})    
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(400).json({'message':'audio not found'})
    }
}

module.exports = {
    getUserPublicImageMetadata,
    getUserPrivateImageMetadata,
    getThumbnailPublicImage,
    getPublicImage,
    getThumbnailPrivateImage,
    getPrivateImage,
    uploadImage,
    updateImage,
    deleteImage
}
