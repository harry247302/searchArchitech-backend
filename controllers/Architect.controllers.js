const { client } = require("../config/client");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const delete_architech_by_id = async (req, res, next) => {
    try {
      const { id } = req.params; // get ID from URL
  
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const query = 'DELETE FROM architech WHERE id = $1 RETURNING *';
      const result = await client.query(query, [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
        deletedUser: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
  

const update_architech_by_id = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const {
        first_name,
        last_name,
        category,
        price,
        phone_number,
        email,
        password_hash,
        street_address,
        apartment,
        city,
        postal_code,
        company_name,
        gst_no,
        state_name,
        active_status
      } = req.body;
  
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
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
  
      const existingUser = await client.query('SELECT * FROM architech WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const existing = existingUser.rows[0];
  
      const query = `
        UPDATE architech
        SET 
          first_name = $1,
          last_name = $2,
          category = $3,
          price = $4,
          phone_number = $5,
          email = $6,
          password_hash = $7,
          street_address = $8,
          apartment = $9,
          city = $10,
          postal_code = $11,
          company_name = $12,
          gst_no = $13,
          profile_url = $14,
          company_brochure_url = $15,
          active_status = $16,
          state_name = $17
        WHERE id = $18
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
        active_status ?? existing.active_status,
        state_name || existing.state_name,
        id
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
  
// ?????????????????????????????????????????????????????????????????????//pagination

const fetch_next_architech = async (req, res, next) => {
  try {
    let { page } = req.query;
    page = parseInt(page) || 1;

    const limit = 10;
    const offset = (page - 1) * limit;

    const query = 'SELECT * FROM architech ORDER BY id LIMIT $1 OFFSET $2;';
    const result = await client.query(query, [limit, offset]);

    res.status(200).json({
      success: true,
      currentPage: page,
      data: result.rows,
      nextPage: result.rows.length === limit ? page + 1 : null,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};


const fetch_previous_architech = async (req, res, next) => {
  try {
    let { page } = req.query;
    page = parseInt(page) || 1;

    // Prevent going to page 0 or below
    if (page <= 1) {
      return res.status(400).json({ message: "Already at the first page." });
    }

    const limit = 10;
    const offset = (page - 2) * limit; // Go to previous page

    const query = 'SELECT * FROM architech ORDER BY id LIMIT $1 OFFSET $2;';
    const result = await client.query(query, [limit, offset]);

    res.status(200).json({
      success: true,
      currentPage: page - 1,
      data: result.rows,
      previousPage: page - 2 > 0 ? page - 2 : null,
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

    let query = `SELECT * FROM architech WHERE 1=1`;
    const values = [];
    let i = 1;

    if (category) {
      query += ` AND category ILIKE $${i++}`;
      values.push(`%${category}%`);
    }

    if (min_price) {
      query += ` AND price >= $${i++}`;
      values.push(min_price);
    }

    if (max_price) {
      query += ` AND price <= $${i++}`;
      values.push(max_price);
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

    const result = await client.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });

  } catch (error) {
    console.error("Error filtering architects:", error);
    next(error);
  }
};


  
  module.exports = { delete_architech_by_id,update_architech_by_id,fetch_previous_architech,fetch_next_architech,filter_architechs};
  