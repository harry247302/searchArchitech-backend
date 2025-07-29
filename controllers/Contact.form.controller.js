const { client } = require("../config/client")

// const contactForm = async (req, res, next) => {
//     try {
//         const result = await client.query('SELECT * FROM contact ORDER BY created_at DESC');
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.log(error)
//         next(error)
//     }
// }

const contactForm = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Get from query
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const result = await client.query(
      'SELECT * FROM contact ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await client.query('SELECT COUNT(*) FROM contact');
    const totalCount = parseInt(countResult.rows[0].count);

    res.status(200).json({
      data: result.rows,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};



const postContactFormDetails = async (req, res, next) => {
    const { first_name, last_name, email, message, phone } = req.body;

    if (!first_name || !last_name || !email || !message || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await client.query(
            `INSERT INTO contact (first_name, last_name, email, phone, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [first_name, last_name, email, phone, message]
        );
        res.status(201).json({
            message: "Form submited successfully!"
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};


const deleteContact = async (req, res) => {
    const { ids } = req.body;
    console.log(ids, "|||||||||||||||||||||||||||||||||||||||");

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Select any query!' });
    }

    try {
        // Use SQL WHERE id = ANY($1)
        const result = await client.query(
            'DELETE FROM contact WHERE uuid = ANY($1::uuid[]) RETURNING uuid',
            [ids]
        );


        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'No contact messages found for provided IDs' });
        }

        res.status(200).json({
            message: `${result.rowCount} contact messages deleted successfully`,
            deletedIds: result.rows.map(row => row.id),
        });
    } catch (error) {
        console.error('Error deleting contact messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    contactForm,
    postContactFormDetails,
    deleteContact
}