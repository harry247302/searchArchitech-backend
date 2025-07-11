const express = require('express');
const multer = require('multer');
// const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const { cloudinary_setup } = require('../controllers/Cloudinary.controller');
const { protect } = require('../middleware/Auth.middleware');
const cloudinaryRouter = express.Router();

const upload = multer({ dest: 'uploads/' });

cloudinaryRouter.post('/', upload.single('image'), cloudinary_setup);

module.exports = cloudinaryRouter;
