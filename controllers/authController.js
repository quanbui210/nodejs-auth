const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const StatusCodes = require('http-status-codes')
const {attachCookies} = require('../utils/jwt')

const User = require('../models/User')
const Token = require('../models/Token')

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
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
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

module.exports = {
    register, 
    login,
    logout
}

