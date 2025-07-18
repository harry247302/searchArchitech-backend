const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });
const { Client } = require('pg')



const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
})

  module.exports = {client}