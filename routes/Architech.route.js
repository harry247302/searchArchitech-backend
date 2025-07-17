const express = require('express')
const multer = require('multer')
const { delete_architech_by_id, update_architech_by_id, fetch_next_architech, fetch_previous_architech, filter_architechs, getArchitectById } = require('../controllers/Architect.controllers')
const { protect } = require('../middleware/Auth.middleware')
const upload = multer({ dest: 'uploads/' });

const architech_router = express.Router()
architech_router.get('/get/architect/:architectId',protect,getArchitectById)
architech_router.delete('/delete/architech/:id', protect, delete_architech_by_id)
architech_router.put('/update/architech/:id', upload.fields([{ name: "profile_url", maxCount: 1 },{ name: "company_brochure_url", maxCount: 1 }]), protect, update_architech_by_id)
architech_router.get('/fetch/architech/next_page',protect,fetch_next_architech)
architech_router.get('/fetch/architech/previous_page',protect,fetch_previous_architech)
architech_router.get('/architech/filter', filter_architechs);

module.exports = architech_router