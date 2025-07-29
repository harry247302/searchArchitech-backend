const express = require('express')
const { otpVerfication } = require('../controllers/Otp.verification.controllers')
const otpVerificationRouter = express.Router()

otpVerificationRouter.post('/getOtp/:email',otpVerfication)


module.exports = otpVerificationRouter