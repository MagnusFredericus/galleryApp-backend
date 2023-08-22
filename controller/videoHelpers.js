const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let privacy = 'public'
        if(req.body.privacy === 'private') {
            privacy = 'private'
        }
        cb(null, `./usersData/${req.user.id}/${privacy}/videos`)
    },
    filename: function(req, file, cb) {
        const suffix = Date.now() + '-' + (Math.round(Math.random() * 1E9) + path.extname(file.originalname))
        cb(null, file.fieldname + '-' + req.user.id + '-' + suffix)
    }
})

fileFilter = (req, file, cb) => {
    allowedExtensions = ['.mkv', '.webm']
    notAllowedExtensions = ['.mp3', '.jpg', '.jpeg', '.png', '.gif', '.bmp']
    if(allowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, true)
    }

    if(notAllowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, false)
    }
}

const uploadVideo = multer({storage:storage, fileFilter:fileFilter})

const checkUserVideoDirectory = (req, res, next) => {
    let userId = req.user.id

    userDirectory = `./usersData/${userId}`
    publicDirectory = `./usersData/${userId}/public`
    privateDirectory = `./usersData/${userId}/private`
    publicVideosDirectory = `./usersData/${userId}/public/videos`
    privateVideosDirectory = `./usersData/${userId}/private/videos`
    publicVideosThumbnailsDirectory = `./usersData/${userId}/public/videos/thumbnails`
    privateVideosThumbnailsDirectory = `./usersData/${userId}/private/videos/thumbnails`
    
    if(!fs.existsSync(userDirectory)) {fs.mkdirSync(userDirectory)}
    if(!fs.existsSync(publicDirectory)) {fs.mkdirSync(publicDirectory)}
    if(!fs.existsSync(privateDirectory)) {fs.mkdirSync(privateDirectory)}
    if(!fs.existsSync(publicVideosDirectory)) {fs.mkdirSync(publicVideosDirectory)}
    if(!fs.existsSync(privateVideosDirectory)) {fs.mkdirSync(privateVideosDirectory)}
    if(!fs.existsSync(publicVideosThumbnailsDirectory)) {fs.mkdirSync(publicVideosThumbnailsDirectory)}
    if(!fs.existsSync(privateVideosThumbnailsDirectory)) {fs.mkdirSync(privateVideosThumbnailsDirectory)}

    next()
}


module.exports = {
    uploadVideo,
    checkUserVideoDirectory
}