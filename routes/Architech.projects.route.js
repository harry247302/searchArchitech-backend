const express = require('express');
const router = express.Router();

router.post('/projects/create', createProject);

router.put('/projects/:id', updateProject);

router.delete('/projects/:id', deleteProject);

router.get('/projects/architect/:architectId', getProjectsByArchitect);

router.get('/projects/:id', getProjectById);

module.exports = router;
