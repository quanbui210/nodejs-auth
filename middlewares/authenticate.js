const { validToken, attachCookies} = require('../utils/jwt')

const authenticateUser = async (req, res, next) => {
    const {accessToken, refreshToken} = req.signedCookies
    try {
        if (accessToken) {
            const payload = validToken(accessToken)
            req.user = payload.user
            return next()
        }
        const payload = validToken(refreshToken)
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken
        })
        if (!existingToken || !existingToken?.isValid) {
            throw new Error('Unauthorized')
        }
        attachCookies({res, user: payload.user, refreshToken: existingToken.refreshToken})
        req.user = payload.user
        next()
    } catch(e) {
        throw new Error('Unauthorized')
    }    
}


const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new Error('Unauthorized')
        }
        next()
    }
}

module.exports = {authenticateUser, authorizePermissions}
