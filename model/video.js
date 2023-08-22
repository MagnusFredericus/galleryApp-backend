const Sequelize = require('sequelize')
const op = Sequelize.Op
const fs = require('fs')

module.exports = (sequelize, DataTypes) => {
    const Video = sequelize.define('video', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            allowNull: false,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        field_name: {
            type: DataTypes.STRING,
        },
        original_name: {
            type: DataTypes.STRING,
        },
        encoding: {
            type: DataTypes.STRING,
        },
        mimetype: {
            type: DataTypes.STRING,
        },
        destination: {
            type: DataTypes.STRING,
        },
        file_name: {
            type: DataTypes.STRING,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
        },
        title: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        privacy: {
            type: DataTypes.STRING,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: Date.now()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: Date.now()
        }
    }, {
        tableName:'videos'
    })

    Video.saveMetadata = async function(user, file, body) {
        const video = this.create({
            user_id: user.id,
            field_name: file.fieldname,
            original_name: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            destination: file.destination,
            file_name: file.filename,
            path: file.path,
            size: file.size,
            title: body.title || null,
            description: body.description || null,
            privacy: body.privacy || 'public'
        })
        return video
    }

    Video.saveMetadataMany = async function(user, files, body) {
        const filesMetadata = files.map(file => {
            return {
                user_id: user.id,
                field_name: file.fieldname,
                original_name: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                destination: file.destination,
                file_name: file.filename,
                path: file.path,
                size: file.size,
                title: null,
                description: null,
                privacy: body?.privacy || 'public'
            }
        })
        
        const videos = await this.bulkCreate(filesMetadata)
        return videos
    }

    Video.getUserVideoMetadata = async function(userId, page, privacy) {
        const limit = 10
        const data = await this.findAndCountAll({
            offset: limit * ( page - 1 ),
            limit: limit,
            order: ['id'],
            where: {
                [op.and] : [
                    {'user_id':userId},
                    {'privacy':privacy}
                ]
            }
        })
    
        if(data.rows.length > 0) {
            const metadata = await (async() => {
                return await Promise.all(data.rows.map(
                    video => {return {
                        'video_id': video.dataValues.id,
                        'field_name': video.dataValues.field_name,
                        'encoding': video.dataValues.encoding,
                        'mimetype': video.dataValues.mimetype,
                        'file_name': video.dataValues.file_name,
                        'size': video.dataValues.size,
                        'title': video.dataValues.title,
                        'description': video.dataValues.description,
                        'privacy': video.dataValues.privacy,
                        'created_at': video.dataValues.created_at,
                        'updated_at': video.dataValues.updated_at
                    }}
                ))
            })()

            const result = {
                count: data.count,
                metadata: metadata
            }

            return result
        } else {
            const result = {
                count: 0,
                metadata: []
            }
            return result
        }
    }

    Video.prototype.updateVideo = async function(data) {
        privacy = data.privacy

        if(privacy) {
            const oldPrivacy = this.privacy
            const newPrivacy = privacy

            if(oldPrivacy !== newPrivacy) {
                const fileName = this.file_name
                
                const newPath = `${__dirname}/../usersData/${data.userId}/${newPrivacy}/videos/${fileName}`
                const oldPath = `${__dirname}/../usersData/${data.userId}/${oldPrivacy}/videos/${fileName}`
                
                const thumbnailFileName = String(fileName).split('.')[0]
                const oldThumbnailPath = `${__dirname}/../usersData/${data.userId}/${oldPrivacy}/videos/thumbnails/${thumbnailFileName}.webp`
                const newThumbnailPath = `${__dirname}/../usersData/${data.userId}/${newPrivacy}/videos/thumbnails/${thumbnailFileName}.webp`
                
                fs.rename(oldPath, newPath, function(e) {
                    if(e) {
                        console.log(e)
                    }
                })
                fs.rename(oldThumbnailPath, newThumbnailPath, function(e) {
                    if(e) {
                        console.log(e)
                    }
                })
            }
        }

        try {
            await this.update(data)
            return this
        } catch(e) {
            //should rollback file path
            throw(e)
        }
    }

    Video.prototype.deleteVideo = async function(userId) {
        const privacy = this.privacy
        const fileName = this.file_name
        const videoPath = `${__dirname}/../usersData/${userId}/${privacy}/videos/${fileName}`
        const thumbnailPath = `${__dirname}/../usersData/${userId}/${privacy}/videos/${fileName}`

        fs.unlinkSync(thumbnailPath)
        fs.unlink(videoPath, async function() {
            try {
                await this.destroy()
            } catch(e) {
                throw(e)
                //should rollback ?
            }
        }.bind(this))
        return
    }

    Video.prototype.toJSON = async function() {
        return {
            'video_id': this.id,
            'field_name': this.field_name,
            'encoding': this.encoding,
            'mimetype': this.mimetype,
            'file_name': this.file_name,
            'size': this.size,
            'title': this.title,
            'description': this.description,
            'privacy': this.privacy,
            'created_at': this.created_at,
            'updated_at': this.updated_at
        }
    }

    return Video
}