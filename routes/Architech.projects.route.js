const express = require('express');
const { getAllProjects, create_project, update_projects_by_architect, delete_projects_by_architect, get_projects_by_architect } = require('../controllers/Architech.projects.controllers');
const { protect } = require('../middleware/Auth.middleware');
const router = express.Router();

router.post('/projects/create',protect,upload.single('image'), create_project);

router.put('/projects/update/:architect_id', update_projects_by_architect);

router.delete('/projects/delete/:architect_id', delete_projects_by_architect);

router.get('/projects/fetch/:architectId', get_projects_by_architect);

router.get('/projects/fetch', getAllProjects);

module.exports = router;
