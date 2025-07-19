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
    state_name
  } = req.body;
console.log("chal teri ma ki chuut");

  console.log(req.files,"/////////////////////////////////////////////////");
  
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
        street_address, apartment, city, postal_code, company_name, gst_no,state_name,
        profile_url, company_brochure_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        first_name, last_name, category, price, phone_number, email, hashPassword,
        street_address, apartment, city, postal_code, company_name, gst_no,state_name,
        profile_url, company_brochure_url
      ]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong', error:error.message });
  }
};

// const login = async (req, res,next) => {
//   const { email, password } = req.body; 
//   try {
//     const userResult = await client.query('SELECT * FROM architech WHERE email = $1', [email]);

//     if (userResult.rows.length === 0) {
//       return res.status(401).send('User not found');
//     }

//     const user = userResult.rows[0];
  
//     if (user.active_status === 'no') {
//       return res.status(403).send({ success: false, message: 'You are under verfication please contact to support' });
//     }

//     const match = await bcrypt.compare(password, user.password_hash);
//     if (!match) {
//       return res.status(401).send('Incorrect password!');
//     }


//     // const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     // const hashedOtp = await bcrypt.hash(otp, 10);

//     // const transporter = nodemailer.createTransport({
//     //   service: "gmail",
//     //   auth: {
//     //     user: process.env.EMAIL_USER,
//     //     pass: process.env.EMAIL_PASS,
//     //   },
//     // });

//     // const mailOptions = {
//     //   from: `"Admin Portal" <${process.env.EMAIL_USER}>`,
//     //   to: email,
//     //   subject: "🔐 Your OTP Code",
//     //   html: `
//     //     <div style="font-family: Arial; padding: 20px; border-radius: 6px; background: #f9f9f9; color: #333;">
//     //       <h2>Admin OTP Verification</h2>
//     //       <p>Your One-Time Password (OTP) is:</p>
//     //       <h1 style="color: white; background: #007bff; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</h1>
//     //       <p>This OTP is valid for 5 minutes. Please do not share it.</p>
//     //     </div>
//     //   `,
//     // };

//     // const info = await transporter.sendMail(mailOptions);
//     // console.log("Email sent:", info.response);

//     // res.status(200).json({
//     //   message: "OTP sent successfully!",
//     //   hashedOtp, 
//     // });



//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET, 
//       { expiresIn: '1h' }
//     );

//      res.cookie({
//       'token': token, 
//       httpOnly: true,                      
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'Strict',                  
//       maxAge: 24 * 60 * 60 * 1000            
//     });

    
//     res.status(200).json({
//       message: 'Login successful',
     
//       user: {
//         id: user.id,
//         category:user.category,
//         price:user.price,
//         phone_number:user.phone_number,
//         apartment:user.apartment,
//         postal_code:user.postal_code,
//         company_name:user.company_name,
//         gst_no:user.gst_no,
//         profile_url:user.profile_url,
//         email: user.email,
//         first_name: user.first_name,
//         last_name: user.last_name,
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send({error:err.message});
//   }
// };

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userResult = await client.query('SELECT * FROM architech WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).send('User not found');
    }

    const user = userResult.rows[0];

    if (user.active_status === 'no') {
      return res.status(403).send({
        success: false,
        message: 'You are under verification. Please contact support.'
      });
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

    // ✅ Fixed res.cookie usage
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        category: user.category,
        price: user.price,
        phone_number: user.phone_number,
        apartment: user.apartment,
        postal_code: user.postal_code,
        company_name: user.company_name,
        gst_no: user.gst_no,
        profile_url: user.profile_url,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }
    });

  } catch (err) {
    console.error(err);
    next(err); // ✅ No res.send() here — let error middleware handle it
  }
};

module.exports = {
    signUp,
    login,
  };