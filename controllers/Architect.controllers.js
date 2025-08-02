const { client } = require("../config/client");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const getArchitectById = async (req, res) => {
  try {
    const architectUuid = req.user.uuid;
    if (!architectUuid) {
      return res.status(400).json({ message: 'Architect UUID is required' });
    }

    const query = `
      SELECT * FROM architech WHERE uuid = $1
    `;

    const result = await client.query(query, [architectUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Architect not found' });
    }

    res.status(200).json({
      architect: result.rows[0],
    });

  } catch (error) {
    console.error('Error fetching architect:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getArchitectProfileById = async (req, res) => {
  try {

    
    const architectId = req.params.uuid;

    // 1. Fetch architect details from "architech" table
    const architectQuery = `
      SELECT 
        id, first_name, last_name, category, price, phone_number, email,
        street_address, apartment, city, postal_code, company_name, gst_no,
        profile_url, company_brochure_url, created_at, active_status, state_name,uuid
      FROM architech
      WHERE uuid = $1
    `;

    const architectResult = await client.query(architectQuery, [architectId]);

    if (architectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Architect not found' });
    }

    const architect = architectResult.rows[0];

    // 2. Fetch feedback with visitor info
    // const feedbackQuery = `
    //   SELECT 
    //     f.id AS feedback_id,
    //     f.rating,
    //     f.comment,
    //     f.created_at,
    //     v.name AS visitor_name,
    //     v.email AS visitor_email
    //   FROM feedback f
    //   JOIN visitors v ON f.visitor_id = v.id
    //   WHERE f.architech_id = $1
    //   ORDER BY f.created_at DESC
    // `;

    // const feedbackResult = await client.query(feedbackQuery, [architectId]);

    // 3. Return combined response
    res.status(200).json({
      architect,
      // feedback: feedbackResult.rows
    });

  } catch (error) {
    console.error('Error fetching architect with feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// const delete_architech_by_id = async (req, res, next) => {
//     try {
//       const { id } = req.params; // get ID from URL
  
//       if (!id) {
//         return res.status(400).json({ message: 'User ID is required' });
//       }
  
//       const query = 'DELETE FROM architech WHERE id = $1 RETURNING *';
//       const result = await client.query(query, [id]);
  
//       if (result.rowCount === 0) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.status(200).json({
//         success: true,
//         message: 'User deleted successfully.',
//         deletedUser: result.rows[0],
//       });
//     } catch (error) {
//       console.error(error);
//       next(error);
//     }
//   };
  
const update_architech_by_id = async (req, res, next) => {
  try {
    const uuid = req.user.uuid;
    console.log("UUID from middleware:", uuid);
    console.log("Request body:", req.body);

    if (!uuid || typeof uuid !== 'string' || uuid.trim() === '') {
      return res.status(400).json({ message: 'Valid UUID is required' });
    }

    // File uploads
    let profileUrl = null;
    let brochureUrl = null;

    if (req.files?.profile_url?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(req.files.profile_url[0].path, {
        folder: 'architech_profiles'
      });
      profileUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.profile_url[0].path);
    }

    if (req.files?.company_brochure_url?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(req.files.company_brochure_url[0].path, {
        folder: 'architech_brochures',
        resource_type: 'auto'
      });
      brochureUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.company_brochure_url[0].path);
    }

    // Fetch existing user by UUID
    const existingUser = await client.query('SELECT * FROM architech WHERE uuid = $1', [uuid]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = existingUser.rows[0];

    const {
      first_name, last_name, category, price, phone_number, email, password_hash,
      street_address, apartment, city, postal_code, company_name, gst_no,
      state_name, instagram_link, linkedin_link, facebook_link, other_link,
      experience, average_rating, description, skills
    } = req.body;

    const query = `
      UPDATE architech
      SET 
        first_name = $1, last_name = $2, category = $3, price = $4,
        phone_number = $5, email = $6, password_hash = $7, street_address = $8,
        apartment = $9, city = $10, postal_code = $11, company_name = $12,
        gst_no = $13, profile_url = $14, company_brochure_url = $15, state_name = $16,
        instagram_link = $17, linkedin_link = $18, facebook_link = $19, other_link = $20,
        experience = $21, average_rating = $22, description = $23, skills = $24
      WHERE uuid = $25
      RETURNING *;
    `;

    const values = [
      first_name || existing.first_name,
      last_name || existing.last_name,
      category || existing.category,
      price || existing.price,
      phone_number || existing.phone_number,
      email || existing.email,
      password_hash || existing.password_hash,
      street_address || existing.street_address,
      apartment || existing.apartment,
      city || existing.city,
      postal_code || existing.postal_code,
      company_name || existing.company_name,
      gst_no || existing.gst_no,
      profileUrl || existing.profile_url,
      brochureUrl || existing.company_brochure_url,
      state_name || existing.state_name,
      instagram_link || existing.instagram_link,
      linkedin_link || existing.linkedin_link,
      facebook_link || existing.facebook_link,
      other_link || existing.other_link,
      experience !== undefined ? experience : existing.experience,
      average_rating !== undefined ? average_rating : existing.average_rating,
      description || existing.description,
      skills || existing.skills,
      uuid
    ];

    const result = await client.query(query, values);

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      updatedUser: result.rows[0],
    });

  } catch (error) {
    console.error("Error updating architect:", error);
    next(error);
  }
};




  // const fetch_next_architech = async (req, res, next) => {
  //   try {
  //     let { page } = req.params;   // get page from URL
  //     page = parseInt(page) || 1;  // default page 1
  
  //     const limit = 5;
  //     const offset = (page - 1) * limit;
  
  //     const query = 'SELECT * FROM architech ORDER BY id LIMIT $1 OFFSET $2;';
  //     const result = await client.query(query, [limit, offset]);
  
  //     res.status(200).json({
  //       success: true,
  //       currentPage: page,
  //       data: result.rows,
  //       nextPage: result.rows.length === limit ? page + 1 : null,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     next(error);
  //   }
  // };
  
  

const fetch_all_architech = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM architech ORDER BY id;';
    const result = await client.query(query);

    res.status(200).json({
      success: true,
      total: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const fetch_architech_by_pagination = async (req, res, next) => {
  try {
    let { page, limit = 5 } = req.query;

    // Convert to integers and provide defaults
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 5;

    const offset = (page - 1) * limit;
    console.log(page,"||||||||||||||||||||||||||||||");
    

    // Get total count of rows
    const countResult = await client.query('SELECT COUNT(*) FROM architech;');
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch paginated data
    const query = 'SELECT * FROM architech ORDER BY id LIMIT $1 OFFSET $2;';
    const result = await client.query(query, [limit, offset]);

    res.status(200).json({
      success: true,
      total,                // total number of records in table
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


// const fetch_previous_architech = async (req, res, next) => {
//   try {
//     let { page } = req.query;
//     page = parseInt(page) || 1;

//     // Prevent going to page 0 or below
//     if (page <= 1) {
//       return res.status(400).json({ message: "Already at the first page." });
//     }

//     const limit = 10;
//     const offset = (page - 2) * limit; // Go to previous page

//     const query = 'SELECT * FROM architech ORDER BY id LIMIT $1 OFFSET $2;';
//     const result = await client.query(query, [limit, offset]);

//     res.status(200).json({
//       success: true,
//       currentPage: page - 1,
//       data: result.rows,
//       previousPage: page - 2 > 0 ? page - 2 : null,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

const delete_multiple_architechs = async (req, res, next) => {
  try {
    const { ids } = req.body; // expecting an array of UUID strings
    console.log(ids,"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs are required in an array' });
    }

    const query = `DELETE FROM architech WHERE uuid = ANY($1::uuid[]) RETURNING *`;
    const result = await client.query(query, [ids]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No users found for deletion' });
    }

    res.status(200).json({
      success: true,
      message: `${result.rowCount} architect's deleted successfully.`,
      deletedUsers: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


//////////////////////////////////////////////////////////////////////////////////////filteratoin
const filter_architechs = async (req, res, next) => {
  try {
    const {
      category,
      min_price,
      max_price,
      city,
      postal_code,
      company_name,
      state_name
    } = req.query;

    console.log("Query received:", req.query);

    let query = `SELECT * FROM architech WHERE 1=1`;
    const values = [];
    let i = 1;

    // 💰 Price filter
    if (min_price && !isNaN(Number(min_price))) {
      query += ` AND price >= $${i++}`;
      values.push(Number(min_price));
    }

    if (max_price && !isNaN(Number(max_price))) {
      query += ` AND price <= $${i++}`;
      values.push(Number(max_price));
    }

    // 🏙️ Other filters
    if (category) {
      query += ` AND category ILIKE $${i++}`;
      values.push(`%${category}%`);
    }

    if (city) {
      query += ` AND city ILIKE $${i++}`;
      values.push(`%${city}%`);
    }

    if (postal_code) {
      query += ` AND postal_code = $${i++}`;
      values.push(postal_code);
    }

    if (company_name) {
      query += ` AND company_name ILIKE $${i++}`;
      values.push(`%${company_name}%`);
    }

    if (state_name) {
      query += ` AND state_name ILIKE $${i++}`;
      values.push(`%${state_name}%`);
    }

    query += ` ORDER BY price ASC`;

    console.log("🧪 Final Query:", query);
    console.log("📦 Bound Values:", values);

    const result = await client.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount
    });

  } catch (error) {
    console.error("Error filtering architects:", error);
    next(error);
  }
};





  
  module.exports = {getArchitectProfileById, delete_multiple_architechs,fetch_all_architech,fetch_architech_by_pagination, getArchitectById,update_architech_by_id,filter_architechs};
  