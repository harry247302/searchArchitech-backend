const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require('../config/client'); // your pg client

const signup_visitor = async (req, res) => {
  const { fullname, email, password, phone_number } = req.body;
  console.log(req.body);

  try {
    const existing = await client.query('SELECT * FROM visitors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await client.query(
      `INSERT INTO visitors (fullname, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *`,
      [fullname, email, hash, phone_number]
    );

    const visitor = result.rows[0];

    const token = jwt.sign(
      { id: visitor.id, email: visitor.email, fullname: visitor.fullname },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

      // Set token as HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production', // use HTTPS in prod
        sameSite: 'Strict',
          maxAge: 60 * 1000,  // 1 minute in milliseconds
      });
      res.cookie('fullname', visitor.fullname, {
        maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

      res.cookie('email', visitor.email, {
        maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

      res.cookie('phone_number', visitor.phone_number, {
        maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

      res.status(201).json({
        message: 'Signup successful',
        visitor: {
          id: visitor.id,
          fullname: visitor.fullname,
          email: visitor.email,
          phone_number: visitor.phone_number,
        },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};


const login_visitor = async (req, res) => {
  const { email, password,fullname } = req.body;

  try {
    const result = await client.query('SELECT * FROM visitors WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    const visitor = result.rows[0];

    const isMatch = await bcrypt.compare(password, visitor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: visitor.id, email: visitor.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
      res.cookie('fullname', visitor.fullname, {
       maxAge: 60 * 1000,
        sameSite: 'Strict',
      });
       res.cookie('token', token, {
        maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

      res.cookie('email', visitor.email, {
       maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

      res.cookie('visitorId', visitor.id, {
      maxAge: 60 * 1000,
        sameSite: 'Strict',
      });

    
    res.status(200).json({
      message: 'Login successful',
      visitor: {
        id: visitor.id,
        name: visitor.name,
        email: visitor.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {signup_visitor,login_visitor}