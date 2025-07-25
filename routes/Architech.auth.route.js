const express = require('express');
const { signUp, login } = require('../controllers/Architech.auth.controller');
const multer = require('multer');
const { protect } = require('../middleware/Auth.middleware');
const upload = multer({ dest: 'uploads/' });
const   authRouter = express.Router();

authRouter
  .post('/login', login)
  .post('/sign-up',upload.fields([
    { name: 'profile_url', maxCount: 1 },
    { name: 'company_brochure_url', maxCount: 1 }
  ]), signUp);

  module.exports = authRouter;
