  // architech route
  const express = require('express');
  const { login, signUp } = require('../controllers/Auth.controller');
  // const { protect } = require('../middleware/Auth.middleware');
// const { protect } = require('../middleware/Auth.middleware');
const multer = require('multer');

// const authRouter = express.Router();

// Setup multer
const upload = multer({ dest: 'uploads/' });
  const authRouter = express.Router();

  authRouter
    .post('/login', login)
    .post('/sign-up',  upload.fields([
      { name: 'profile_url', maxCount: 1 },
      { name: 'company_brochure_url', maxCount: 1 }
    ]), signUp);

  module.exports = authRouter;
