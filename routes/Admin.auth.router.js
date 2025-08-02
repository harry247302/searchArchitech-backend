const express = require('express');
const multer = require('multer')
const { admin_signUp, admin_login, blockArchitech, checkAuth, getAdminsDetails, update_admin_by_id } = require('../controllers/Admin.auth.controller');
const { protect } = require('../middleware/Auth.middleware');
const upload = multer({ dest: 'uploads/' });
const admin_authRouter = express.Router();  

admin_authRouter.post('/admin/login', admin_login);
admin_authRouter.post('/admin/sign-up', upload.single('profile_image'), admin_signUp);
admin_authRouter.get("/check", checkAuth);
admin_authRouter.put('/admin/block-architect', protect, blockArchitech);
admin_authRouter.get('/all',protect, getAdminsDetails);
// admin_authRouter.put('/update', update_admin_by_id);


module.exports = admin_authRouter;
