const express = require('express')
const router = express.Router()
const upload = require('../handler/multer')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = router
