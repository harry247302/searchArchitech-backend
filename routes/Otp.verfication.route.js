const express = require('express')
const { otpVerfication } = require('../controllers/Otp.verification.controllers')
const otpVerificationRouter = express.Router()

otpVerificationRouter.get('/',otpVerfication)


module.exports = otpVerificationRouter