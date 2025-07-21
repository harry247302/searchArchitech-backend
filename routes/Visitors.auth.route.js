const express = require('express')
const { login_visitor, signup_visitor, google_login } = require('../controllers/Visitors.auth.controllers')
const visitor_routers = express.Router()

visitor_routers.post('/visitor-logIn',login_visitor)

visitor_routers.post('/visitor-signUp',signup_visitor)
visitor_routers.post('/visitor-google-login', google_login)

module.exports = visitor_routers 