const dotenv = require('dotenv');
dotenv.config();

//I intend to use this when we will use nodemailer to send emails to user to confirm their email.
//The password should be saved in the .env file and picked up from here

module.exports = {
  endpoint: process.env.API_URL,
  masterKey: process.env.API_KEY,
  PASS: process.env.PASS,
  EMAIL: process.env.EMAIL, 
  API_URL: process.env.API_URL
};