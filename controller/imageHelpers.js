const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let privacy = 'public'
        if(req.body.privacy === 'private') {
            privacy = 'private'
        }
        cb(null, `./usersData/${req.user.id}/${privacy}/images`)
    },
    filename: function(req, file, cb) {
        const suffix = Date.now() + '-' + (Math.round(Math.random() * 1E9) + path.extname(file.originalname))
        cb(null, file.fieldname + '-' + req.user.id + '-' + suffix)
    }
})

fileFilter = (req, file, cb) => {
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    notAllowedExtensions = ['.mp3', '.mkv', '.webm']
    if(allowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, true)
    }

    if(notAllowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, false)
    }
}

const uploadImage = multer({storage:storage, fileFilter:fileFilter})

const checkUserImageDirectory = (req, res, next) => {
    let userId = req.user.id

    userDirectory = `./usersData/${userId}`
    publicDirectory = `./usersData/${userId}/public`
    privateDirectory = `./usersData/${userId}/private`
    publicImagesDirectory = `./usersData/${userId}/public/images`
    privateImagesDirectory = `./usersData/${userId}/private/images`
    publicImagesThumbnailsDirectory = `./usersData/${userId}/public/images/thumbnails`
    privateImagesThumbnailsDirectory = `./usersData/${userId}/private/images/thumbnails`
    
    if(!fs.existsSync(userDirectory)) {fs.mkdirSync(userDirectory)}
    if(!fs.existsSync(publicDirectory)) {fs.mkdirSync(publicDirectory)}
    if(!fs.existsSync(privateDirectory)) {fs.mkdirSync(privateDirectory)}
    if(!fs.existsSync(publicImagesDirectory)) {fs.mkdirSync(publicImagesDirectory)}
    if(!fs.existsSync(privateImagesDirectory)) {fs.mkdirSync(privateImagesDirectory)}
    if(!fs.existsSync(publicImagesThumbnailsDirectory)) {fs.mkdirSync(publicImagesThumbnailsDirectory)}
    if(!fs.existsSync(privateImagesThumbnailsDirectory)) {fs.mkdirSync(privateImagesThumbnailsDirectory)}

    next()
}

module.exports = {
    uploadImage,
    checkUserImageDirectory
}