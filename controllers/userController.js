const User = require('../models/User')

const getAllUsers = async(req, res) => {
    const allUsers = await User.find({}).populate('audioFiles')
    if (allUsers.length < 1) {
        res.json({msg: "no users found"})
    }
    res.status(200).json({allUsers})
}


module.exports = {getAllUsers}