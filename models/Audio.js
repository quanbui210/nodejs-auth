const mongoose = require('mongoose')

const AudioSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    duration: { type: Number },  // In seconds
    uploader: { type: Schema.Types.ObjectId, ref: 'User' },  // Reference to User model
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Audio', AudioSchema);