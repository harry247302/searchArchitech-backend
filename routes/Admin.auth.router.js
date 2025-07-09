const express = require('express');
const { admin_signUp, admin_login, blockArchitech } = require('../controllers/Admin.authl.controller');

const authRouter = express.Router();  // <-- Declare authRouter here

// Define your routes
authRouter.post('/admin/login', admin_login);
authRouter.post('/admin/sign-up', admin_signUp);
authRouter.put('/admin/block-architect', blockArchitech);

module.exports = authRouter;  // <-- Export it
