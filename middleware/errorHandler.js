const errorHandler = (err, req, res, nest) => {
    console.log('==== Untreated exception')
    console.log(err)
    console.log('====')
    req.error = err
    return res.status(500).json({'message':'internal server error'})
}

module.exports = errorHandler