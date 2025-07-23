const express = require('express');
const { submitFeedback, getFeedbackByArchitect } = require('../controllers/Feedback.controller');
const feedback_router = express.Router()


feedback_router.post('/', submitFeedback);
feedback_router.get('/get-feedback/:architectId', getFeedbackByArchitect);


module.exports = feedback_router