const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
      },
      email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
          validator: validator.isEmail,
          message: 'Please provide valid email',
        },
      },
      password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
    },
      role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
      },
      passwordToken: {
        type: String
      },
      passwordTokenExpiryDate: {
        type: Date
      },
      audioFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Audio' }]
})


UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (userPassword) {
    const passwordMatch = await bcrypt.compare(userPassword, this.password)
    return passwordMatch
}


module.exports = mongoose.model('User', UserSchema)