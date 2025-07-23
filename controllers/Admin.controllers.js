
const fs = require('fs');
const { client } = require('../config/client');
const cloudinary = require('cloudinary').v2;


const architech_approval = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { active_status } = req.body;
  
      if (!id) {
        return res.status(400).json({ message: 'Architect ID is required.' });
      }
  
      if (!['yes', 'no'].includes(active_status)) {
        return res.status(400).json({ message: "active_status must be 'yes' or 'no'." });
      }
  
      const result = await client.query(
        `UPDATE architech
         SET active_status = $1
         WHERE id = $2
         RETURNING id, active_status`,
        [active_status, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Architect not found.' });
      }
  
      res.status(200).json({
        success: true,
        message: 'Active status updated successfully.',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating active_status:', error);
      next(error);
    }
  };

  const update_admin_by_id = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const {
        email,
        first_name,
        last_name,
        designation,
        phone_number
      } = req.body;
  
      const existing = await client.query('SELECT * FROM admin WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ message: 'Admin not found.' });
      }
      const admin = existing.rows[0];
  
      if (designation === 'Super Admin') {
        const check = await client.query(
          `SELECT id FROM admin WHERE designation = 'Super Admin' AND id != $1`,
          [id]
        );
        if (check.rows.length > 0) {
          return res.status(400).json({ message: 'Only one Super Admin is allowed.' });
        }
      }
  
      let profileImageUrl = admin.profile_image;
      if (req.files?.profile_image?.[0]) {
        const uploadResult = await cloudinary.uploader.upload(req.files.profile_image[0].path, {
          folder: 'admin_profiles'
        });
        profileImageUrl = uploadResult.secure_url;
        fs.unlinkSync(req.files.profile_image[0].path); 
      }

      const result = await client.query(
        `UPDATE admin SET
           email = $1,
           first_name = $2,
           last_name = $3,
           designation = $4,
           phone_number = $5,
           profile_image = $6
         WHERE id = $8
         RETURNING id, email, first_name, last_name, designation, phone_number, profile_image`,
        [
          email || admin.email,
          first_name || admin.first_name,
          last_name || admin.last_name,
          designation || admin.designation,
          phone_number || admin.phone_number,
          profileImageUrl,
          id
        ]
      );
  
      res.status(200).json({
        success: true,
        message: 'Admin updated successfully.',
        data: result.rows[0]
      });
  
    } catch (error) {
      console.error('Error updating admin:', error);
      next(error);
    }
  };
  
module.exports = { architech_approval,update_admin_by_id };
  