const { client } = require("../config/client");

const submitFeedback = async (req, res) => {
  try {
    const { visitor_id, architech_id, rating, comment } = req.body;
    // console.log(req.body,"---------------------------------------");

    if (!visitor_id || !architech_id || !rating) {
      return res
        .status(400)
        .json({ message: "visitor_id, architech_id and rating are required" });
    }

    const insertQuery = `
      INSERT INTO feedback (visitor_id, architech_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const { rows } = await client.query(insertQuery, [
      visitor_id,
      architech_id,
      rating,
      comment || "",
    ]);

    res.status(201).json({ message: "Feedback submitted", feedback: rows[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFeedbackByArchitect = async (req, res) => {
  try {
    const architectId = req.user.uuid;

    // Get page and limit from query, with default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const selectQuery = `
      SELECT f.id, f.rating, f.comment, f.created_at, v.fullname as visitor_name, v.email as visitor_email
      FROM feedback f
      JOIN visitors v ON f.visitor_id = v.visitoruuid
      WHERE f.architech_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3;
    `;

    const { rows } = await client.query(selectQuery, [
      architectId,
      limit,
      offset,
    ]);

    res.status(200).json({
      feedback: rows,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getFeedbackByArchitect, submitFeedback };
