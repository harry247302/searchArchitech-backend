const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan')
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const { client } = require('./config/client');
const { Client }  = require('pg');
const authRouter = require('./routes/Auth.route');
const { client } = require('./config/client');
const admin_authRouter = require('./routes/Admin.auth.router');


dotenv.config({ path: './config/config.env' });
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors('*'));
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
app.use('/architec',authRouter)
app.use('/superAdmin',admin_authRouter)


///////////////////////////////////////////////////////////////server////////////////////
app.get('/', (req, res) => {
  res.send('Pikachu...!');
});
PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});