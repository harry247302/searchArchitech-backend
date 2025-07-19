const express = require('express');
const multer = require('multer')
const { admin_signUp, admin_login, blockArchitech, checkAuth } = require('../controllers/Admin.auth.controller');
const { protect } = require('../middleware/Auth.middleware');
const upload = multer({ dest: 'uploads/' });
const authRouter = express.Router();  

authRouter.post('/admin/login', admin_login);
authRouter.post('/admin/sign-up', upload.single('profile_image'), admin_signUp);
authRouter.get("/check", checkAuth);
authRouter.put('/admin/block-architect', protect, blockArchitech);

module.exports = authRouter;
