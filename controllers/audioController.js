const StatusCodes = require('http-status-codes')
const AudioFile = require("../models/Audio")
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { STATUS_CODES } = require('http');



const uploadAudioFile = async (req, res) => {
    const file = req.file
    const { title, description, uploadedBy, duration } = req.body
    const audioFile = new AudioFile({
        title,
        description,
        fileUrl: file.path,
        uploader: uploadedBy,
        duration 
    })
    await audioFile.save()
    res.status(200).json({msg: "Successfully signed up!", audioFile})
}

const getAllFiles = async (req, res) => {
    const allFiles = await User.find({})
    if (allFiles.length < 1) {
        res.json({msg: 'no files found'})
    }
    res.status(StatusCodes.StatusCodes.OK).json({allFiles})
}