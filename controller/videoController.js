const path = require('path')
const fs = require('fs')
const db = require('../model/sequelize')
const ffmpeg = require('fluent-ffmpeg')

const getUserPublicVideoMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page

    try {
        const result = await db.Video.getUserVideoMetadata(userId, page, 'public')
        
        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }
    } catch(e) {
        next(e)
    }
}

const getUserPrivateVideoMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page
    
    try {
        const result = await db.Video.getUserVideoMetadata(userId, page, 'private')

        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }
    } catch(e) {
        next(e)
    }
}

const getThumbnailPublicVideo = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'public', 'videos', 'thumbnails')
    }

    return res.sendFile(fileName, options)
}

const getPublicVideo = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'public', 'videos')
    }

    //can cause some problems if the processing (converting types) is no finished
    return res.sendFile(fileName, options)
}

const getThumbnailPrivateVideo = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'private', 'videos', 'thumbnails')
    }

    if(parseInt(userId) === req.user.id) {
        return res.sendFile(fileName, options)
    } else {
        return res.status(403).json({'message':'forbidden'})
    }
}

const getPrivateVideo = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'private', 'videos')
    }

    //can cause some problems if the processing (converting types) is no finished
    if(parseInt(userId) === req.user.id) {
        return res.sendFile(fileName, options)
    } else {
        return res.status(403).json({'message':'forbidden'})
    }
}

const uploadVideo = async(req, res, next) => {
    if(req.file) {
        const originalPath = req.file.path
        const array = String(req.file.path).split('/')
        const fileName = array.pop().split('.')[0]
        const basePath = array.join('/')
    
        req.file.mimetype = 'image/mp4'
        req.file.filename = `${fileName}.mp4`
        req.file.path = `${basePath}/${fileName}.mp4`
    
        try {
            //save metadata
            await db.Video.saveMetadata(req.user, req.file, req.body)

            //create thumbnail
            ffmpeg(originalPath)
            .screenshots({
                timestamps: [0],
                filename: `${fileName}.webp`,
                folder: `${basePath}/thumbnails/`
            })
    
            //change vídeo format and delete original file (take too long)
            //This operation take a long time to run and should be implemented elsewhere
            //Similar operations on images and audios may take a long time to run too
            ffmpeg({source: originalPath})
            .toFormat('mp4')
            .saveToFile(`${basePath}/${fileName}.mp4`, function(retcode, e) {
                if(e) {
                    next(e)
                }
            }).on('end', async function() {
                fs.unlinkSync(originalPath)
            })
    
            return res.status(200).json({'message': 'video saved'})
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(204).json({'message':'file format not allowed'})
    }
}

const updateVideo = async(req, res, next) => {
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

    let video = {}
    try {
        video = await db.Video.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }

    try {
        if(video instanceof db.Video && video.user_id === parseInt(userId)) {
            try {
                video = await video.updateVideo(data)
                videoJSON = await video.toJSON()
                return res.status(200).json(videoJSON)
            } catch(e) {
                console.log(e)
                return res.sendStatus(500)
            }
        } else {
            return res.sendStatus(500)
        }
    } catch(e) {
        next(e)
    }
}

const deleteVideo = async(req, res, next) => {
    const userId = req.user.id
    const id = req.params.id

    let video = {}
    try {
        video = await db.Video.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }
    
    if(video instanceof db.Video && video.user_id === parseInt(userId)) {
        try {
            await video.deleteVideo(userId)
            return res.status(200).json({'message':'deleted'})    
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(400).json({'message':'video not found'})
    }
}

module.exports = {
    getUserPublicVideoMetadata,
    getUserPrivateVideoMetadata,
    getThumbnailPublicVideo,
    getPublicVideo,
    getThumbnailPrivateVideo,
    getPrivateVideo,
    uploadVideo,
    updateVideo,
    deleteVideo
}
