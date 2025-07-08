// routes/Auth.route.js
const express = require('express');
const { login, signUp } = require('../controllers/Auth.controller');
const { protect } = require('../middleware/Auth.middleware');

const authRouter = express.Router();

authRouter
  .post('/login',protect, login)
  .post('/sign-up',protect, signUp);

module.exports = authRouter;
