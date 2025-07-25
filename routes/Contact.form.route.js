const express = require('express');
const ContactRouter = express.Router();
// const contactController = require('../controllers/contactController');
const { contactForm, postContactFormDetails, deleteContact } = require('../controllers/Contact.form.controller');

ContactRouter.get('/fetch', contactForm);
ContactRouter.post('/submit', postContactFormDetails);
ContactRouter.delete('/deleteById/:id', deleteContact);

module.exports = ContactRouter;
