const { client } = require("../config/client");

exports.createProject = async (req, res) => {
  try {
    const {
      architect_id,
      title,
      description,
      category,
      location,
      start_date,
      end_date,
      images,
      videos,
      budget,
      status,
    } = req.body;

    // Basic validation
    if (!architect_id || !title || !description) {
      return res.status(400).json({ error: 'architect_id, title and description are required' });
    }

    const query = `
      INSERT INTO projects
      (architect_id, title, description, category, location, start_date, end_date, images, videos, budget, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *;
    `;

    const values = [
      architect_id,
      title,
      description,
      category || null,
      location || null,
      start_date || null,
      end_date || null,
      images || null,
      videos || null,
      budget || null,
      status || 'Published',
    ];

    const result = await client.query(query, values);

    res.status(201).json({ message: 'Project created successfully', project: result.rows[0] });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// You can add other controller methods below (updateProject, deleteProject, etc.)
