import jwt from 'jsonwebtoken';
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { client } = require('../config/client');

const signUp = async (req,res)=>{
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
      } = req.body;
      console.log(req.body,"*************************************************");
      
    try {
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password_hash,salt) 
        console.log(hashPassword,"|||||||||||||||||||||||||||||||||||");
        
        const newUser = await client.query(
            `INSERT INTO users (
              first_name, last_name, category, price, phone_number, email, password_hash,
              street_address, apartment, city, postal_code, company_name, gst_no,
              profile_url, company_brochure_url
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING *`,
            [
              first_name, last_name, category, price, phone_number, email, hashPassword,
              street_address, apartment, city, postal_code, company_name, gst_no,
              profile_url, company_brochure_url
            ]
          );
      
         
            res.status(201).json({
                message: 'User registered successfully',
                user: newUser.rows[0],
            });

    } catch (error) {
      console.log(error)
    }
}


const login = async (req, res) => {
  const { email, password } = req.body; 
  try {
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).send('User not found');
    }

    const user = userResult.rows[0];

    if (user.active_status === 'no') {
      return res.status(403).send({ success: false, message: 'Your account is blocked, please contact support.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).send('Incorrect password!');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Send success response with token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        category:user.category,
        price:user.price,
        phone_number:user.phone_number,
        apartment:user.apartment,
        postal_code:user.postal_code,
        company_name:user.company_name,
        gst_no:user.gst_no,
        profile_url:user.profile_url,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
};

module.exports = {
    signUp,
    login,
  };