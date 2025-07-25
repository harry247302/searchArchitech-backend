const express = require('express');
const { getAllProjects, create_project, update_projects_by_architect, delete_projects_by_architect, get_projects_by_architect } = require('../controllers/Architech.projects.controllers');
const { protect } = require('../middleware/Auth.middleware');
const project_router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' });


project_router.post('/create',protect,upload.fields([{ name: "image", maxCount: 1 },{ name: "videos", maxCount: 1 }]),create_project);


project_router.put('/update/:architect_id', update_projects_by_architect);

project_router.delete('/delete/:architect_id', delete_projects_by_architect);

project_router.get('/fetch/:architectId', get_projects_by_architect);

project_router.get('/fetch', getAllProjects);

module.exports = project_router;
