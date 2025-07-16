const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

// const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const generateAndSendOtp = async (req, res) => {
  try {
 

  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

module.exports = generateAndSendOtp;

// module.exports = generateAndSendOtp;
