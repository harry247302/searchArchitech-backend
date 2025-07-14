const express = require('express')
const { delete_architech_by_id, update_architech_by_id } = require('../controllers/Architect.controllers')
const { protect } = require('../middleware/Auth.middleware')
const architech_router = express.Router()

architech_router.delete('/delete/architech/:id',protect,delete_architech_by_id)
architech_router.put('/update/architech/:id', upload.fields([{ name: "profile_url", maxCount: 1 },
    { name: "company_brochure_url", maxCount: 1 }]),protect,update_architech_by_id)

module.exports = architech_router