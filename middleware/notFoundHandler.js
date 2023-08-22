const notFoundHandler = (req, res) => {
    return res.status(404).json({'message':'not found'})
}

module.exports = notFoundHandler