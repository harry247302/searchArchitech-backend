const express = require('express');
const { getAllProjects, create_project, update_projects_by_architect, delete_projects_by_architect, get_projects_by_architect } = require('../controllers/Architech.projects.controllers');
const { protect } = require('../middleware/Auth.middleware');
const project_router = express.Router();
const multer = require('multer')
const upload = multer({ dest: 'uploads/' });

project_router.post(
    '/create',
    protect,
    upload.fields([
      { name: "images", maxCount: 10 },
      { name: "videos", maxCount: 10 }
    ]),
    create_project
  );
  

project_router.put('/update/:architect_id', update_projects_by_architect);

project_router.delete('/delete/:project_uuid',protect, delete_projects_by_architect);

project_router.get('/fetchByArchitect', protect, get_projects_by_architect);

project_router.get('/fetch', getAllProjects);

module.exports = project_router;
