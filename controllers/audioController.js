const StatusCodes = require('http-status-codes')
const AudioFile = require("../models/Audio")
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const fs = require('fs');

const createUploadDirectories = () => {
    const audioDir = path.join(__dirname, './uploads/audio');
    const otherDir = path.join(__dirname, './uploads/other');

    if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
    }
    if (!fs.existsSync(otherDir)) {
        fs.mkdirSync(otherDir, { recursive: true });
    }
};


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        createUploadDirectories(); // Ensure directories are created before upload
        if (file.mimetype === 'audio/mpeg') {
            cb(null, './uploads/audio');
        } else {
            cb(null, './uploads/other');
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage}).single('audioFile')
const uploadFiles = multer({storage}).array('audioFiles[]')

const uploadAudioFile = async (req, res) => {
   upload(req,res,async () => {
        if (!req.file) {
            return res.status(404).json({msg: "no file"})
        }
        const {title, description, duration} = req.body
        const existingFile = await AudioFile.findOne({title})
        if (existingFile) {
            return res.status(500).json({msg: `${title} already exist`})
        }
        const audioFile = new AudioFile({
            title,
            description,
            duration,
            fileUrl: path.join("./uploads/audio", req.file.filename)
        })
        await audioFile.save()
        res.status(200).json({msg: 'file uploaded successfully', audioFile})
   })
}
const uploadManyFiles = async (req, res) => {
    uploadFiles(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ msg: "File upload error", error: err });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: "No files uploaded" });
        }

        const titles = req.body.titles; // Get titles
        const descriptions = req.body.descriptions; // Get descriptions
        const durations = req.body.durations; // Get durations
        const audioFiles = [];

        // Validate input lengths
        if (titles.length !== req.files.length || descriptions.length !== req.files.length || durations.length !== req.files.length) {
            return res.status(400).json({ msg: "Titles, descriptions, and durations must match the number of files uploaded" });
        }

        // Process each file
        for (let i = 0; i < req.files.length; i++) {
            const audioFile = new AudioFile({
                title: titles[i],
                description: descriptions[i],
                duration: durations[i],
                fileUrl: path.join("./uploads/audio", req.files[i].filename)
            });

            await audioFile.save();
            audioFiles.push(audioFile);
        }

        res.status(200).json({ msg: 'Files uploaded successfully', audioFiles });
    });
}


const getAllFiles = async (req, res) => {
    const allFiles = await AudioFile.find({})
    if (allFiles.length < 1) {
        res.json({msg: 'no files found'})
    }
    res.status(200).json({allFiles})
}

module.exports = {uploadAudioFile, getAllFiles, uploadManyFiles}