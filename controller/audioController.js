const path = require('path')
const fs = require('fs')
const db = require('../model/sequelize')

const getUserPublicAudioMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page

    try {
        const result = await db.Audio.getUserAudioMetadata(userId, page, 'public')

        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }    
    } catch(e) {
        next(e)
    }
}

const getUserPrivateAudioMetadata = async(req, res, next) => {
    const userId = req.params.id
    const page = req.params.page

    try {
        const result = await db.Audio.getUserAudioMetadata(userId, page, 'private')

        if(result.metadata.length > 0) {
            return res.status(200).json(result)
        } else {
            return res.sendStatus(204)
        }    
    } catch(e) {
        next(e)
    }
}

const getPublicAudio = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }

    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'public', 'audios')
    }

    return await res.sendFile(fileName, options)
}

const getPrivateAudio = async(req, res) => {
    const userId = req.params.id
    const fileName = req.params.file

    if(!fileName) {
        return res.status(400).json({'message':'file name required'})
    }
    
    var options = {
        root: path.join(__dirname, '..','usersData', userId, 'private', 'audios')
    }

    if(parseInt(userId) === req.user.id) {
        return res.sendFile(fileName, options)
    } else {
        return res.status(403).json({'message':'forbidden'})
    }
}

const uploadAudio = async(req, res, next) => {
    try {
        if(req.file) {
            await db.Audio.saveMetadata(req.user, req.file, req.body)
            return res.status(200).json({'message': 'audio saved'})
        } else {
            return res.status(400).json({'message':'file format not allowed'})
        }
    } catch(e) {
        next(e)
    }
}

const updateAudio = async(req, res, next) => {
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

    let audio = {}
    try {
        audio = await db.Audio.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }

    if(audio instanceof db.Audio && audio.user_id === parseInt(userId)) {
        try {
            audio = await audio.updateAudio(data)
            audioJSON = await audio.toJSON()
            return res.status(200).json(audioJSON)
        } catch(e) {
            console.log(e)
            return res.sendStatus(500)
        }
    } else {
        next(e)
    }
}

const deleteAudio = async(req, res) => {
    const userId = req.user.id
    const id = req.params.id

    let audio = {}
    try {
        audio = await db.Audio.findOne({where: {'id': id}})
    } catch(e) {
        next(e)
    }
    
    if(audio instanceof db.Audio && audio.user_id === parseInt(userId)) {
        try {
            await audio.deleteAudio(userId)
            return res.status(200).json({'message':'deleted'})    
        } catch(e) {
            next(e)
        }
    } else {
        return res.status(400).json({'message':'audio not found'})
    }
}

module.exports = {
    getUserPublicAudioMetadata,
    getUserPrivateAudioMetadata,
    getPublicAudio,
    getPrivateAudio,
    uploadAudio,
    updateAudio,
    deleteAudio
}