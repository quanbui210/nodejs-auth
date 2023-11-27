const jwt = require('jsonwebtoken')

const createJWT = ({payload}) => jwt.sign(payload, process.env.JWT_SECRET)

const validToken = (token) => jwt.verify(token, process.env.JWT_SECRET)


const attachCookies = ({ res, user, refreshToken }) => {
    const accessTokenJWT = createJWT({ payload: {user} });
    const refreshTokenJWT = createJWT({ payload: {user, refreshToken} });
    const oneDay = 1000 * 60 * 60 * 24;
    const thirtyDays = 1000 * 60 * 60 * 24 * 30;
  
    res.cookie('accessToken', accessTokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      expires: new Date(Date.now() + oneDay),
    });
    res.cookie('refreshToken', refreshTokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      expires: new Date(Date.now() + thirtyDays),
    });
  };


module.exports = {
    createJWT, validToken, attachCookies
}