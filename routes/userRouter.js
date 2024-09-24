const {getAllUsers} = require("../controllers/userController")
const express = require('express')
const router = express.Router()

const {authenticateUser} = require('../middlewares/authenticate')



router.route('/').get( getAllUsers)


module.exports = router