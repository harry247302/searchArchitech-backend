const express = require('express');
const { getAllVisitors, getVisitorById, updateVisitor, deleteVisitor } = require('../controllers/Visitors.controllers');
const router = express.Router();

router.get('/visitors', getAllVisitors);
router.get('/visitors/:id', getVisitorById);
router.put('/visitors/:id', updateVisitor);
router.delete('/visitors/:id', deleteVisitor);

module.exports = router;
