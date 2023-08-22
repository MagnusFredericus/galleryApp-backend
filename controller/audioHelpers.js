const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let privacy = 'public'
        if(req.body.privacy === 'private') {
            privacy = 'private'
        }
        cb(null, `./usersData/${req.user.id}/${privacy}/audios`)
    },
    filename: function(req, file, cb) {
        const suffix = Date.now() + '-' + (Math.round(Math.random() * 1E9) + path.extname(file.originalname))
        cb(null, file.fieldname + '-' + req.user.id + '-' + suffix)
    }
})

fileFilter = (req, file, cb) => {
    allowedExtensions = ['.mp3']
    notAllowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.mkv', '.webm']
    if(allowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, true)
    }

    if(notAllowedExtensions.includes(path.extname(file.originalname))) {
        return cb(null, false)
    }
}

const uploadAudio = multer({storage:storage, fileFilter:fileFilter})

const checkUserAudioDirectory = (req, res, next) => {
    let userId = req.user.id

    userDirectory = `./usersData/${userId}`
    publicDirectory = `./usersData/${userId}/public`
    privateDirectory = `./usersData/${userId}/private`
    publicAudiosDirectory = `./usersData/${userId}/public/audios`
    privateAudiosDirectory = `./usersData/${userId}/private/audios`
    
    if(!fs.existsSync(userDirectory)) {fs.mkdirSync(userDirectory)}
    if(!fs.existsSync(publicDirectory)) {fs.mkdirSync(publicDirectory)}
    if(!fs.existsSync(privateDirectory)) {fs.mkdirSync(privateDirectory)}
    if(!fs.existsSync(publicAudiosDirectory)) {fs.mkdirSync(publicAudiosDirectory)}
    if(!fs.existsSync(privateAudiosDirectory)) {fs.mkdirSync(privateAudiosDirectory)}
    
    next()
}


module.exports = {
    uploadAudio,
    checkUserAudioDirectory
}