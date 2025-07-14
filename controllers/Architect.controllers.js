const { client } = require("../config/client");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const delete_architech_by_id = async (req, res, next) => {
    try {
      const { id } = req.params; // get ID from URL
  
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
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
      active_status
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let profileUrl = null;
    let brochureUrl = null;

    // 🔼 Upload profile image if provided
    if (req.files?.profile_url?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(req.files.profile_url[0].path, {
        folder: 'architech_profiles'
      });
      profileUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.profile_url[0].path);
    }

    // 🔼 Upload company brochure if provided
    if (req.files?.company_brochure_url?.[0]) {
      const uploadResult = await cloudinary.uploader.upload(req.files.company_brochure_url[0].path, {
        folder: 'architech_brochures',
        resource_type: 'auto'
      });
      brochureUrl = uploadResult.secure_url;
      fs.unlinkSync(req.files.company_brochure_url[0].path);
    }

    // ✅ Get existing data for fallback values
    const existingUser = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = existingUser.rows[0];

    const query = `
      UPDATE users
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
        active_status = $16
      WHERE id = $17
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

  
//   module.exports = {  };
  
  module.exports = { delete_architech_by_id,update_architech_by_id };
  