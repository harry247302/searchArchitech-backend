const jwt  = require('jsonwebtoken') ;
const bcrypt = require('bcrypt');
const { client } = require("../config/client");

 const admin_signUp = async (req,res)=>{
    const {
        first_name,
        last_name,
        phone_number,
        email,
        password_hash,
        profile_image,
        designation
      } = req.body;
      console.log(req.body,"*************************************************");
      
    try {
        const userCheck = await client.query('SELECT * FROM admin WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password_hash,salt) 
        console.log(hashPassword,"|||||||||||||||||||||||||||||||||||");
        
        const admin = await client.query(
            `INSERT INTO admin (
              first_name, last_name,  phone_number, email, password_hash,profile_url, designation,
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7
            ) RETURNING *`,
            [
                first_name, last_name,  phone_number, email, password_hash,profile_image, designation,
            ]
          );
            res.status(201).json({
                message: 'User registered successfully',
                admin: admin.rows[0],
            });
    } catch (error) {
      console.log(error)
    }
}

 const admin_login = async (req, res,next) => {
  const { email, password } = req.body; 
  try {
    const adminResult = await client.query('SELECT * FROM admin WHERE email = $1', [email]);

    if (adminResult.rows.length === 0) {
      return res.status(401).send('User not found');
    }

    const admin = adminResult.rows[0];

 

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).send('Incorrect password!');
    }

  
    const token = jwt.sign(
    { id: admin.id,
        phone_number:admin.phone_number,
        profile_image:admin.profile_image,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        desgination:admin.desgination},
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        phone_number:admin.phone_number,
        profile_image:admin.profile_image,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        desgination:admin.desgination
      }
    });

  } catch (err) {
    console.error(err);
    next(err)
    res.status(500).send('Login error');
  }
};

 const blockArchitech = async (req,res,next)=>{
    try {
      const {active_status,email} = req.body
      const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  
      const updateResult = await client.query(
        'UPDATE users SET active_status = $1 WHERE email = $2 RETURNING *',
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

  module.exports = { admin_signUp,admin_login,blockArchitech };