var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var User = require('./../schema/userschema');
const nodemailer = require('nodemailer');

const { PASS, EMAIL, API_URL } = require('./../config');

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

router.post('/', (req, res) => {
    let { email } = req.body;
    
    User.findOne({email: email}, (err, doc) => {
        if(!doc) return res.send('Cette email n\'existe pas, Creer un nouveau compte')

        if(doc.use_account_status !=='valid') return res.send('please, validate your email address first');
        
        if(err) return console.log(err);
        
        // Checking if the user exists
        if(doc){
            // Preparing to send the email confirmation after registration
            let URL = `${API_URL}/api/newpasswordlink/?fname=${doc.fname}&lname=${doc.lname}&token=${doc.token}`;
            let text = `<div style="max-width: 400px; border: solid 1px #ccc; padding: 20px;margin-left: auto; margin-right: auto;box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24); border-radius: 10px;"><h2 style="text-align: center;">Nouveau Mot de Passe</h2><h4>Cher ${doc.fname},</h4><p style="padding-bottom: 15px;">Cliquez sur le bouton ci dessous pour créer un nouveau mot de passe.</p><p style="text-align: center;"><a style="border: solid 1px #ccc; padding: 12px; background-color: green; text-decoration: none; color: #fff; border-radius: 5px;" href=${URL}>Nouveau Mot de Passe</a></p><br/><br/></div>`;

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
                subject: 'Nouveau Mot de Pass',
                html: text
            };

            transport.sendMail(mailOptions, function(error, info){
                if (error) return console.log(error);
                res.send('Check your email to reset your password')
                // else{res.redirect('/');}
            });
        }
    });
})

module.exports = router;