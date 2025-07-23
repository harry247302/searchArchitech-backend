// architech controller

const jwt  = require('jsonwebtoken') ;
const bcrypt = require('bcrypt');
const { client } = require('../config/client');
const cloudinary = require("../config/cloudinary");
const fs = require('fs');


const signUp = async (req, res) => {
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
    state_name
  } = req.body;

  try {
    const userCheck = await client.query('SELECT * FROM architech WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password_hash, salt);

    let profile_url = '';
    let company_brochure_url = '';

    if (req.files?.profile_url?.[0]) {
      const profileResult = await cloudinary.uploader.upload(req.files.profile_url[0].path, {
        folder: 'uploads'
      });
      profile_url = profileResult.secure_url;
      fs.unlinkSync(req.files.profile_url[0].path);
    }

    if (req.files?.company_brochure_url?.[0]) {
      const brochureResult = await cloudinary.uploader.upload(req.files.company_brochure_url[0].path, {
        folder: 'uploads'
      });
      company_brochure_url = brochureResult.secure_url;
      fs.unlinkSync(req.files.company_brochure_url[0].path);
    }

    const newUser = await client.query(
      `INSERT INTO architech (
        first_name, last_name, category, price, phone_number, email, password_hash,
        street_address, apartment, city, postal_code, company_name, gst_no, state_name,
        profile_url, company_brochure_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        first_name, last_name, category, price, phone_number, email, hashPassword,
        street_address, apartment, city, postal_code, company_name, gst_no, state_name,
        profile_url, company_brochure_url
      ]
    );

    const user = newUser.rows[0];

    // ✅ Generate JWT token (expires in 1 minute)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret", // use strong secret in production
      { expiresIn: "1m" } // 1 minute
    );

    // ✅ Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 1000, // 1 minute in milliseconds
      secure: process.env.NODE_ENV === "production", // send cookie only over HTTPS in production
      sameSite: "strict",
    });

    res.status(201).json({
      message: "Registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


const login = async (req, res,next) => {
  const { email, password } = req.body; 
  try {
    const userResult = await client.query('SELECT * FROM architech WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).send('User not found');
    }

    const user = userResult.rows[0];

    if (user.active_status === 'no') {
      return res.status(403).send({ success: false, message: 'You are under verfication' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).send('Incorrect password!');
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('architectToken', token, {
      httpOnly: false,                      
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',                  
      maxAge: 60 * 1000
    });
    

    
    res.status(200).json({
      message: 'Login successful',
     
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
    next(err)
    res.status(500).send('Login error');
  }
};

module.exports = {
    signUp,
    login,
  };