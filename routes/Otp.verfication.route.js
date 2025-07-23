const express = require('express')
const { otpVerfication } = require('../controllers/Otp.verification.controllers')
const otpVerificationRouter = express.Router()

otpVerificationRouter.get('/getOtp/:email',otpVerfication)


module.exports = otpVerificationRouter