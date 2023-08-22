const fs = require('fs')
const morgan = require('morgan')
const path = require('path')

morgan.token('userId', function(req) {
    if(req.user) {
        return req.user.id
    } else {
        return ''
    }
})

morgan.token('InputFormData', function(req) {
    if(req.body) {
        let data = req.body
        if(data.password) {
            data.password = '****'
            return JSON.stringify(data)
        }
        return JSON.stringify(req.body)
    } else {
        return ''
    }
})

morgan.token('InputFile', function(req) {
    if(req.file) {
        return JSON.stringify(req.file.filename)
    }
    if(req.files) {
        return JSON.stringify(req.files.map(file => {return file.filename}))
    }
    return ''
})

morgan.token('error', function(req) {
    return req.error
})


const format = '[:date[clf]] :method :url :userId [:InputFormData][:InputFile] :status :response-time ms'
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a+'})
const logger = morgan(format, {stream:accessLogStream})

const errorFormat = '[:date[clf]] :method :url :userId [:InputFormData][:InputFile] :status :response-time ms :error'
const errorLogStream = fs.createWriteStream(path.join(__dirname, 'error.log'), { flags: 'a+'})
const errorLogger = morgan(errorFormat, {
    stream:errorLogStream,
    skip: function(req, res) {return res.statusCode < 400}
})

module.exports = {
    logger,
    errorLogger
}