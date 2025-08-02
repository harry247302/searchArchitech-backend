const express = require('express');
const { getAllVisitors, getVisitorById, updateVisitor, deleteVisitor, getVisitorsByTodayTomorrow } = require('../controllers/Visitors.controllers');
const { protect } = require('../middleware/Auth.middleware');
const VisitorRouter = express.Router();

VisitorRouter.get('/visitors',protect, getAllVisitors);
VisitorRouter.get('/getVisitorById',protect, getVisitorById);
VisitorRouter.put('/visitors/:id',protect, updateVisitor);
VisitorRouter.delete('/visitors/:id',protect, deleteVisitor);
VisitorRouter.get('/visitors-by-today-tomorrow',getVisitorsByTodayTomorrow)
module.exports = VisitorRouter;
