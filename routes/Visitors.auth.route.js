const express = require('express')
const { login_visitor, signup_visitor } = require('../controllers/Visitors.auth.controllers')
const visitor_routers = express.Router()

visitor_routers.post('/visitor-logIn',login_visitor)

visitor_routers.post('/visitor-signUp',signup_visitor)

module.exports = visitor_routers 