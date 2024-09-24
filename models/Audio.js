const mongoose = require('mongoose')

const AudioSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    duration: { type: Number },  // In seconds
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Audio', AudioSchema);