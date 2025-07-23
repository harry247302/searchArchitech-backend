const jwt  = require('jsonwebtoken') ;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const { client } = require("../config/client");
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
dotenv.config({ path: './config/config.env' });


const  admin_signUp = async (req, res) => {
  const {
    first_name,
    last_name,
    phone_number,
    password,
    email
  } = req.body;

  console.log(req.body);
  
  try {
 
    const userCheck = await client.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let profile_image = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'admin_profiles'
      });
      profile_image = result.secure_url;
      console.log(result , "_____________");
      

     
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

  
    const salt = await bcrypt.genSalt(10);
    console.log("salt", salt);
    console.log("password_hash", password);
    

    
    const hashPassword = await bcrypt.hash(password, salt);
    console.log("hashPassword", hashPassword);
    

   
    const admin = await client.query(
      `INSERT INTO admin (
        first_name, last_name, phone_number, email,
        password_hash, profile_image
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, phone_number, email, hashPassword, profile_image]
    );

    res.status(201).json({
      message: 'User registered successfully',
      admin: admin.rows[0],
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


const admin_login = async (req, res, next) => {
  const { email, password_hash } = req.body;
  console.log(req.body);
  if (!email || !password_hash) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const adminResult = await client.query('SELECT * FROM admin WHERE email = $1', [email]);

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const admin = adminResult.rows[0];
    

    const match = await bcrypt.compare(password_hash, admin.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        phone_number: admin.phone_number,
        profile_image: admin.profile_image,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        designation: admin.designation,  // fixed typo here
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    //  const { email } = req.body;
    // if (!email) return res.status(400).json({ message: "Recipient email is required" });

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const hashedOtp = await bcrypt.hash(otp, 10);

    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS,
    //   },
    // });

    // const mailOptions = {
    //   from: `"Admin Portal" <${process.env.EMAIL_USER}>`,
    //   to: email,
    //   subject: "🔐 Your OTP Code",
    //   html: `
    //     <div style="font-family: Arial; padding: 20px; border-radius: 6px; background: #f9f9f9; color: #333;">
    //       <h2>Admin OTP Verification</h2>
    //       <p>Your One-Time Password (OTP) is:</p>
    //       <h1 style="color: white; background: #007bff; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</h1>
    //       <p>This OTP is valid for 5 minutes. Please do not share it.</p>
    //     </div>
    //   `,
    // };

    // const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.response);


    res.cookie('token', token, {
      httpOnly: true,                      
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',                  
      maxAge: 24 * 60 * 60 * 1000            
    });

    res.status(200).json({
      message: 'Login successful',
      // hashedOtp,
      user: {
        phone_number: admin.phone_number,
        profile_image: admin.profile_image,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        designation: admin.designation,  // fixed typo here
      }
    });

console.log(token,"|||||||||||||||||||||||||||||||||||||||||||||||");

  } catch (err) {
    console.error(err);
    next(err);  // just call next(err), do not send res after next()
  }
};

 const blockArchitech = async (req,res,next)=>{
    try {
      const {active_status,email} = req.body
      const userResult = await client.query('SELECT * FROM architech WHERE email = $1', [email]);
  
      const updateResult = await client.query(
        'UPDATE architech SET active_status = $1 WHERE email = $2 RETURNING *',
        [active_status, email]
      );
  
      if (userResult.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, message: `User status updated to ${active_status}`, user: updateResult.rows[0] });
  
    } catch (error) {
      next(error)
      console.log(error)
      res.status(500).send({success: false, message: 'Internal server error' })
    }
  }


  const checkAuth = (req,res)=>{
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ message: "Authenticated", user: decoded });
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
  module.exports = { admin_signUp,admin_login,blockArchitech ,checkAuth};