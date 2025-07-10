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
      const { id } = req.params; // Get ID from URL
  
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
        profile_url,
        company_brochure_url,
        active_status
      } = req.body;
  
      if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
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
        profile_url,
        company_brochure_url,
        active_status,
        id
      ];
  
      const result = await client.query(query, values);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        updatedUser: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
  
//   module.exports = {  };
  
  module.exports = { delete_architech_by_id,update_architech_by_id };
  