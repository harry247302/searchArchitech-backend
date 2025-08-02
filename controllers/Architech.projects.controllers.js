const { client } = require('../config/client');
const multer = require("multer");
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const cloudinary = require("../config/cloudinary");



const getAllProjects = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM projects ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch all projects' });
  }
};

const create_project = async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    start_date,
    end_date,
    budget,
    status,
  } = req.body;

  console.log("Received files:", req.files);

  const architect_uuid = req.user.uuid;
  const parsedBudget = parseFloat(budget);

  if (isNaN(parsedBudget)) {
    return res.status(400).json({ error: "Invalid budget value" });
  }

  try {
    let imageUrls = [];
    let videoUrls = [];
    if (req.files && Array.isArray(req.files.images)) {
      for (const file of req.files.images) {
        try {
          const uploadRes = await cloudinary.uploader.upload(file.path, {
            folder: "uploads",
          });
          imageUrls.push(uploadRes.secure_url);
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Cloudinary image upload failed for", file.originalname, err);
        }
      }
    }
    
    if (req.files && Array.isArray(req.files.videos)) {
      for (const file of req.files.videos) {
        try {
          const uploadRes = await cloudinary.uploader.upload(file.path, {
            folder: "uploads",
            resource_type: "video",
          });
          videoUrls.push(uploadRes.secure_url);
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error("Cloudinary video upload failed for", file.originalname, err);
        }
      }
    }
    

    console.log("Uploaded image URLs::::::::::::::::::::::::", imageUrls);
    console.log("Uploaded video URLs::::::::::::::::::::::;:", videoUrls);

    const result = await client.query(
      `INSERT INTO projects (
        architect_uuid, title, description, category,
        location, start_date, end_date,
        images, videos, budget, status,
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *`,
      [
        architect_uuid,
        title,
        description,
        category,
        location,
        start_date,
        end_date,
        imageUrls,
        videoUrls,
        parsedBudget,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};




const get_projects_by_architect = async (req, res) => {
  const architect_uuid = req.user.uuid; // architect's UUID from middleware

  console.log("Logged in user:", req.user);

  try {
    const result = await client.query(
      'SELECT * FROM projects WHERE architect_uuid = $1 ORDER BY id DESC',
      [architect_uuid]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};



const update_projects_by_architect = async (req, res) => {
  const { architect_id } = req.params;
  const {
    title, description, category, location,
    start_date, end_date, budget, status
  } = req.body;

  try {
    let imageUrl = null;
    let videoUrl = null;

    // Upload image if sent
    if (req.files?.image?.[0]) {
      const imageUpload = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'uploads'
      });
      imageUrl = imageUpload.secure_url;
      fs.unlinkSync(req.files.image[0].path);
    }

    // Upload video if sent
    if (req.files?.videos?.[0]) {
      const videoUpload = await cloudinary.uploader.upload(req.files.videos[0].path, {
        folder: 'uploads',
        resource_type: 'video'
      });
      videoUrl = videoUpload.secure_url;
      fs.unlinkSync(req.files.videos[0].path);
    }

    const existing = await client.query(
      `SELECT * FROM projects WHERE architect_id = $1 LIMIT 1`,
      [architect_id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "No project found for this architect" });
    }

    const existingData = existing.rows[0];

    const result = await client.query(
      `UPDATE projects SET
        title = $1, description = $2, category = $3, location = $4,
        start_date = $5, end_date = $6,
        images = $7, videos = $8,
        budget = $9, status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE architect_id = $11
      RETURNING *`,
      [
        title || existingData.title,
        description || existingData.description,
        category || existingData.category,
        location || existingData.location,
        start_date || existingData.start_date,
        end_date || existingData.end_date,
        imageUrl ? [imageUrl] : existingData.images,
        videoUrl ? [videoUrl] : existingData.videos,
        budget || existingData.budget,
        status || existingData.status,
        architect_id
      ]
    );

    res.status(200).json({ message: "Project updated", data: result.rows[0] });

  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};


const delete_projects_by_architect = async (req, res) => {
  const { project_uuid } = req.params;  // ✅ Extract UUID string properly
  
  try {
    const result = await client.query(
      'DELETE FROM projects WHERE project_uuid = $1 RETURNING *',
      [project_uuid]
    );
    console.log(result.rows,":::::::::::::::::::::::::::::::::::::::::::::::");

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No projects found for this architect' });
    }

    res.status(200).json({ message: 'Projects deleted successfully', deleted: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete projects' });
  }
};



module.exports = {
  getAllProjects,
  create_project,
  get_projects_by_architect,
  update_projects_by_architect,
  delete_projects_by_architect
}