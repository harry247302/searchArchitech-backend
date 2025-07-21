const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { client } = require('../config/client'); // your pg client

const signup_visitor = async (req, res) => {
  const { name, email, password } = req.body;

  try {
   
    const existing = await client.query('SELECT * FROM visitors WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await client.query(
      `INSERT INTO visitors (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hash]
    );

    res.status(201).json({
      message: 'Signup successful',
      visitor: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


const login_visitor = async (req, res) => {
  const { email, password } = req.body;
    console.log(req.body);
    

  try {
    const result = await client.query('SELECT * FROM visitors WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }

    const visitor = result.rows[0];

    const isMatch = await bcrypt.compare(password, visitor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: visitor.id, email: visitor.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
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

const google_login = async(req,res)=>{
  const { name, email, password } = req.body;  
  console.log(req.body);
  
  let visitor;
try {
   visitor = await client.query('SELECT * FROM visitors WHERE email = $1', [email]);  

   const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  
  if (visitor.rows.length==0){
     visitor = await client.query(
      `INSERT INTO visitors (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hash]
    );
  }

   visitor = visitor.rows[0]
console.log(visitor);

const token = jwt.sign(
  { id: visitor.id, email: visitor.email, designation: visitor.designation },
  process.env.JWT_SECRET,
  { expiresIn: '1d' }
);
res.status(200).json({
  message: 'Login successful',
  token,
  visitor: {
    id: visitor.id,
    name: visitor.name,
    email: visitor.email
  }
})
  
} catch (error) {
  console.log("")
  res.status(500).json({message:"Server error", error:error.message})
}
}


module.exports = {signup_visitor,login_visitor,google_login}