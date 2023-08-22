const config = require('../config/config')
const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize(
    config.sqlConfig.DB,
    config.sqlConfig.USER,
    config.sqlConfig.PASSWORD, {
        host: config.sqlConfig.HOST,
        dialect: config.sqlConfig.dialect,
        define: {
            timestamps: false
        },
        pool: {
            max: config.sqlConfig.max,
            min: config.sqlConfig.min,
            acquire: config.sqlConfig.acquire,
            idle: config.sqlConfig.idle
        }
    }
)

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.User = require('./user')(sequelize, DataTypes)
db.Image = require('./image')(sequelize, DataTypes)
db.Audio = require('./audio')(sequelize, DataTypes)
db.Video = require('./video')(sequelize, DataTypes)

db.User.hasMany(db.Image, {foreignKey: 'user_id'})
db.Image.belongsTo(db.User, {foreignKey: 'user_id'})

db.User.hasMany(db.Audio, {foreignKey: 'user_id'})
db.Audio.belongsTo(db.User, {foreignKey: 'user_id'})

db.User.hasMany(db.Video, {foreignKey: 'user_id'})
db.Video.belongsTo(db.User, {foreignKey: 'user_id'})

module.exports = db