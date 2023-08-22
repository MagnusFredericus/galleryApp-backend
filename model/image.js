const Sequelize = require('sequelize')
const op = Sequelize.Op
const fs = require('fs')

module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('image', {
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
        tableName:'images'
    })

    Image.saveMetadata = async function(user, file, body) {
        const image = this.create({
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
        return image
    }

    Image.saveMetadataMany = async function(user, files, body) {
        const filesMetadatada = files.map(file => {
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
        
        const images = await this.bulkCreate(filesMetadatada)
        return images
    }

    Image.getUserImageMetadata = async function(userId, page, privacy) {
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
                    image => {return {
                        'image_id': image.dataValues.id,
                        'field_name': image.dataValues.field_name,
                        'encoding': image.dataValues.encoding,
                        'mimetype': image.dataValues.mimetype,
                        'file_name': image.dataValues.file_name,
                        'size': image.dataValues.size,
                        'title': image.dataValues.title,
                        'description': image.dataValues.description,
                        'privacy': image.dataValues.privacy,
                        'created_at': image.dataValues.created_at,
                        'updated_at': image.dataValues.updated_at
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

    Image.prototype.updateImage = async function(data) {
        privacy = data.privacy

        if(privacy) {
            const oldPrivacy = this.privacy
            const newPrivacy = privacy

            if(oldPrivacy !== newPrivacy) {
                const fileName = this.file_name
                const oldPath = `${__dirname}/../usersData/${data.userId}/${oldPrivacy}/images/${fileName}`
                const oldThumbailPath = `${__dirname}/../usersData/${data.userId}/${oldPrivacy}/images/thumbnails/${fileName}`
                
                const newPath = `${__dirname}/../usersData/${data.userId}/${newPrivacy}/images/${fileName}`
                const newThumbailPath = `${__dirname}/../usersData/${data.userId}/${newPrivacy}/images/thumbnails/${fileName}`
                
                fs.rename(oldPath, newPath, function(e) {
                    if(e) {
                        console.log(e)
                    }
                })

                fs.rename(oldThumbailPath, newThumbailPath, function(e) {
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

    Image.prototype.deleteImage = async function(userId) {
        const privacy = this.privacy
        const fileName = this.file_name
        const imagePath = `${__dirname}/../usersData/${userId}/${privacy}/images/${fileName}`
        const thumbnailPath = `${__dirname}/../usersData/${userId}/${privacy}/images/thumbnails/${fileName}`

        fs.unlinkSync(thumbnailPath)
        fs.unlink(imagePath, async function() {
            try {
                await this.destroy()
            } catch(e) {
                throw(e)
                //should rollback ?
            }
        }.bind(this))
        return
    }

    Image.prototype.toJSON = async function() {
        return {
            'image_id': this.id,
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

    return Image
}