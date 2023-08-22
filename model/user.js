const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            isEmail:true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return 'write only property'
            },
            set(value) {
                this.setDataValue('password', this.generatePasswordHash(value))
            }
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
        tableName:'users'
    })

    User.prototype.generatePasswordHash = function(password) {
        return bcrypt.hashSync(password, 10)
    }

    User.prototype.checkPassword = function(guess) {
        return bcrypt.compareSync(guess, this.getDataValue('password'))
    }

    return User
}