// architech route
const express = require('express');
const { login, signUp } = require('../controllers/Auth.controller');
const { protect } = require('../middleware/Auth.middleware');

const authRouter = express.Router();

authRouter
  .post('/login', login)
  .post('/sign-up', signUp);

module.exports = authRouter;
