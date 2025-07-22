
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const bcrypt = require('bcrypt')

const otpVerfication = async(req,res,next)=>{
    const {email} = req.params
    console.log(email);
    
    try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Admin Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your OTP Code",
      html: `
        <div style="font-family: Arial; padding: 20px; border-radius: 6px; background: #f9f9f9; color: #333;">
          <h2>Admin OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: white; background: #007bff; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</h1>
          <p>This OTP is valid for 5 minutes. Please do not share it.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
   
    res.cookie('Otp', hashedOtp, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 1000
  });

    res.status(200).json({
      message: "OTP sent successfully!",
      hashedOtp, 
    });
    } catch (error) {
        console.log(error)
        // next(error)
    }
}


module.exports = {otpVerfication}