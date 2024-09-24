const express = require('express');
const router = express.Router()
const {uploadAudioFile, getAllFiles, uploadManyFiles} = require('../controllers/audioController');
const { authorizePermissions, authenticateUser } = require('../middlewares/authenticate');

router.route('/uploads').post(authenticateUser, uploadAudioFile)
router.get('/all', getAllFiles)
router.route('/uploads/many').post(authenticateUser, uploadManyFiles)

module.exports = router