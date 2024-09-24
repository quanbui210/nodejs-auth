const express = require('express');
const router = express.Router()

const {uploadAudioFile, getAllFiles, uploadManyFiles} = require('../controllers/audioController')

router.post('/uploads', uploadAudioFile)
router.get('/all', getAllFiles)
router.post('/uploads/many', uploadManyFiles)

module.exports = router