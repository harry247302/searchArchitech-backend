const { client } = require("../config/client");


const getAllVisitors = async (req, res) => {
  try {
    const result = await client.query('SELECT id, name, email, created_at FROM visitors');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getVisitorById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM visitors WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching visitor by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const updateVisitor = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  try {
    const result = await pool.query(
      'UPDATE visitors SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, name, email, created_at',
      [name, email, password, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const deleteVisitor = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM visitors WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visitor not found' });
    res.status(200).json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
    getAllVisitors,
    getVisitorById,
    updateVisitor,
    deleteVisitor
}