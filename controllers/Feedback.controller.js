const { client } = require("../config/client");


const  submitFeedback = async (req, res) => {
  try {
    const { visitor_id, architech_id, rating, comment } = req.body;

    if (!visitor_id || !architech_id || !rating) {
      return res.status(400).json({ message: 'visitor_id, architech_id and rating are required' });
    }

    const insertQuery = `
      INSERT INTO feedback (visitor_id, architech_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const { rows } = await client.query(insertQuery, [visitor_id, architech_id, rating, comment || '']);

    res.status(201).json({ message: 'Feedback submitted', feedback: rows[0] });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error',error:error.message });
  }
};

const getFeedbackByArchitect = async (req, res) => {
  try {
    const { architectId } = req.params;

    const selectQuery = `
  SELECT 
    f.id AS feedback_id,
    f.rating,
    f.comment,
    f.created_at,

    -- Visitor Info
    v.id AS visitor_id,
    v.name AS visitor_name,
    v.email AS visitor_email,

    -- Architect Info
    a.id AS architect_id,
    a.first_name AS architect_first_name,
    a.last_name AS architect_last_name,
    a.email AS architect_email

  FROM feedback f
  JOIN visitors v ON f.visitor_id = v.id
  JOIN architech a ON f.architech_id = a.id
  WHERE f.architech_id = $1
  ORDER BY f.created_at DESC;
`;


    const { rows } = await client.query(selectQuery, [architectId]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {getFeedbackByArchitect,submitFeedback}