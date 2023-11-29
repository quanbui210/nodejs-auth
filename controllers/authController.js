const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const StatusCodes = require('http-status-codes')
const {attachCookies} = require('../utils/jwt')
const sendResetPasswordEmail = require('../utils/sendResetPassword')

const User = require('../models/User')
const Token = require('../models/Token')
const { log } = require('console')

const register = async(req, res) => {
    const {name, email, password} = req.body
    const existingUser = await User.findOne({email})
    if (existingUser) {
        throw new Error (`User with email ${email} already created`)
    }
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role});
    res.status(200).json({msg:'Successfully signed up!', user})
}



const login = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
       throw new Error('Please provide email and password');
    }
    const user = await User.findOne({ email });
    if (!user) {
       throw new Error('Invalid Credentials');
    }
    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
        throw new Error('Wrong Password')
    }
    const tokenUser = {
        name: user.name,
        userId: user._id,
        role: user.role
    }
    // const token = jwt.sign(tokenUser, process.env.JWT_SECRET)
    let refreshToken = ''
    const existingToken = await Token.findOne({user: user._id})
    if (existingToken) {
        const {isValid} = existingToken
    if (!isValid) {
      throw new Error('Verify your email')
    }
    refreshToken = existingToken.refreshToken
    attachCookies({ res, user: tokenUser, refreshToken });
    res.status(200).json({ user: tokenUser});
    return
  }
    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const userToken = {refreshToken, ip, userAgent, user: user._id}
    await Token.create(userToken)
    attachCookies({res, user: tokenUser, refreshToken})
    res.status(201).json({ user: tokenUser});
}

const logout = async (req, res) => {
  await Token.findOneAndDelete({user: req.user.userId})
  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

const forgotPassword = async(req, res) => {
  const {email} = req.body
  if (!email) {
    throw new Error('please provide valid email')
  }
  const user = await User.findOne({email})
  const passwordToken = crypto.randomBytes(70).toString('hex')
  if (user) {
    const origin = 'http://localhost:3000'
    await sendResetPasswordEmail({
      email: user.email,
      token: passwordToken,
      origin 
    })
    const tenMins = 1000 * 60 * 10
    const passwordTokenExp = new Date(Date.now()+ tenMins)
    user.passwordToken = passwordToken
    user.passwordTokenExpiryDate = passwordTokenExp
    await user.save()
  }

  //send email with link to reset password
  res.status(201).json({msg: 'please check your email for reset password link', token: passwordToken})
}

const resetPassword = async(req, res) => {
  const {newPassword, token, email} = req.body
  if (!token || !email || !newPassword) {
    throw new Error('Please provide all values')
  }
  const user = await User.findOne({email})
  if (user) {
    console.log(user.passwordToken === token);
    const currentDate = new Date()
    console.log(user.passwordTokenExpiryDate, currentDate);
    if (user.passwordToken === token && user.passwordTokenExpiryDate > currentDate) {
      user.password = newPassword
      console.log(newPassword)
      user.passwordToken = null
      user.passwordTokenExpiryDate = null
      await user.save()
    }
  }
  //update password
  res.status(201).json({msg: "Your password is changed"})
}

module.exports = {
    register, 
    login,
    logout,
    forgotPassword,
    resetPassword
}

