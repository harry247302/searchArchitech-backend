const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactForm, postContactFormDetails, deleteContact } = require('../controllers/Contact.form.controller');

router.get('/contact', contactForm);
router.post('/contact', postContactFormDetails);
router.delete('/contact/:id', deleteContact);

module.exports = router;
