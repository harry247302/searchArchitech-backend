const express = require('express');
const multer = require('multer')
const { admin_signUp, admin_login, blockArchitech } = require('../controllers/Admin.auth.controller');
const { protect } = require('../middleware/Auth.middleware');
const generateAndSendOtp = require('../controllers/OtpVerification.controller');
const upload = multer({ dest: 'uploads/' });

const authRouter = express.Router();  

authRouter.post('/admin/login', admin_login);
authRouter.post('/admin/sign-up', upload.single('profile_image'), admin_signUp);
// authRouter.get('/otp-verify',generateAndSendOtp)
authRouter.put('/admin/block-architect', protect, blockArchitech);

module.exports = authRouter;
