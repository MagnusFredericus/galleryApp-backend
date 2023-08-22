class inputError extends Error {
    constructor(cause) {
        super()
        this.cause = cause
        this.type = 'Input error'
    }
}

module.exports = {
    inputError
}