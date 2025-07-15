const express = require('express')
const { architech_approval, update_admin_by_id } = require('../controllers/Admin.controllers')
const super_admin_router = express.Router()
const multer = require('multer');
const upload = multer({ dest: 'temp/' }); // temp directory


super_admin_router.put('/architech/status/:id',architech_approval)
router.put(
    '/admin/:id',
    upload.fields([{ name: 'profile_image', maxCount: 1 }]),
    update_admin_by_id
  );

module.exports = super_admin_router