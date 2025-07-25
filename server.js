const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan')
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { Client }  = require('pg');
const authRouter = require('./routes/Architech.auth.route');
const { client } = require('./config/client');

const productRouter = require('./routes/Product.route');
const architech_router = require('./routes/Architech.route');
const cloudinaryRouter = require('./routes/Cloudinary.upload.route');
const visitor_routers = require('./routes/Visitors.auth.route');
const feedback_router = require('./routes/Feedback.route');
const project_router = require('./routes/Architech.projects.route');
const otpVerificationRouter = require('./routes/Otp.verfication.route');
const ticketRrouter = require('./routes/Tickets.router');
const admin_authRouter = require('./routes/Admin.auth.router');
const ContactRouter = require('./routes/Contact.form.route');

dotenv.config({ path: './config/config.env' });
app.use(morgan('dev'));
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true                
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

////////////////////////////////////////////////////////////////////database///////////////////////
client.connect()
    .then(() => {
        console.log('Connected to the database...');
    })
    .catch((err) => {
        console.log(err);
    })


///////////////////////////////////////////////////////////////////////////cookies/////////////////
app.get('/set-cookie', (req, res) => {
  res.cookie('token', '123abc', { httpOnly: true, maxAge: 3600000 }); // 1 hour
  res.send('Cookie set');
});

app.get('/get-cookie', (req, res) => {
  const token = req.cookies.token;
  res.send(`Token from cookie: ${token}`);
});

///////////////////////////////////////////////////////////////routes/////////////////////
app.use('/auth/architech',authRouter)
app.use('/superAdmin',admin_authRouter)
app.use('/product',productRouter)
app.use('/architech',architech_router)
app.use('/upload_files',cloudinaryRouter)
app.use('/visitor_routers',visitor_routers)
app.use('/projects',project_router)
app.use('/otpVerification',otpVerificationRouter)
app.use('/api/feedback',feedback_router)
app.use('/tickets',ticketRrouter)
app.use('/contact',ContactRouter)
///////////////////////////////////////////////////////////////server////////////////////
app.get('/', (req, res) => {
  res.send('Pikachu...!');
});
PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});



