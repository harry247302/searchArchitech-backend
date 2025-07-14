// architech controller

const jwt  = require('jsonwebtoken') ;
const bcrypt = require('bcrypt');
const { client } = require('../config/client');
const cloudinary = require("../config/cloudinary");

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
  } = req.body;

  try {
    const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
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
    console.log(error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};

const login = async (req, res,next) => {
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
    next(err)
    res.status(500).send('Login error');
  }
};


module.exports = {
    signUp,
    login,
  };