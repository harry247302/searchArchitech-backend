const express = require('express');
const multer = require('multer')
const { admin_signUp, admin_login, blockArchitech } = require('../controllers/Admin.auth.controller');
const { protect } = require('../middleware/Auth.middleware');
const upload = multer({ dest: 'uploads/' });

const authRouter = express.Router();  

authRouter.post('/admin/login', admin_login);

authRouter.post('/admin/sign-up', upload.fields([{ name: "imageUrl", maxCount: 1 }]), admin_signUp);

authRouter.put('/admin/block-architect', protect, blockArchitech);

module.exports = authRouter;
