const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require('../schema/userschema');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //Remove this line before deployment. This was made to solve nodemailer not able to send confirmation email

const { PASS, EMAIL, API_URL } = require('./../config')

const nodemailer = require('nodemailer');

const TokenGenerator = require('uuid-token-generator');

mongoose.connect('mongodb://localhost/tontine', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

// End point Create a new Tontine (Session)
router.post('/', (req, res) => {

  // prepare the token generator
  const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

  // I ve use the trim to remove empty space after the meeting_name, so if the user type "name  ", it will trim to "name"
  User.findOne({email: req.body.email.trim()}, (err, doc) => {
    
    if(err) return console.log(err);
    if(doc) return res.send('Compte deja cree');

    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
      let token = tokgen.generate();

      // Getting the input data to save them to the database
      var user = new User({
        fname: req.body.fname.trim(),
        lname: req.body.lname.trim(),
        email: req.body.email.trim(),
        password: hash,
        registration_time: new Date(Date.now()),
        use_account_status: 'invalid',
        token: token
      });
      
      // Saving to the database
      user.save((err, user) => {
        if(err) return console.log(err); 
        // res.send(user);
        res.send('Visit your email box and confirm your password then you can login');
      });

      // Preparing to send the email confirmation after registration
      let URL = `${API_URL}/api/validateuser/?fname=${req.body.fname.trim()}&lname=${req.body.lname.trim()}&token=${token}`;
      let text = `<div style="max-width: 400px; border: solid 1px #ccc; padding: 20px;margin-left: auto; margin-right: auto;box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); border-radius: 10px;"><h2 style="text-align: center;">Bienvenue</h2><h4>Cher ${req.body.fname},</h4><p style="padding-bottom: 15px;">Merci de vous etres inscrit</p><p style="text-align: center;"><a style="border: solid 1px #ccc; padding: 12px; background-color: green; text-decoration: none; color: #fff; border-radius: 5px;" href=${URL}>CONFIRMEZ VOTRE EMAIL</a></p><br/><br/></div>`;
      
      let transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: EMAIL,
          pass: PASS
        }
      });
      
      var mailOptions = {
        from: EMAIL,
        to: req.body.email,
        subject: 'Comfirmez votre Email',
        html: text
      };
      
      transport.sendMail(mailOptions, function(error, info){
        if (error) return console.log(error);
        // else{res.redirect('/');}
     });

    });
    
  });
});
module.exports = router;