var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var User = require('./../schema/userschema');

const bcrypt = require('bcrypt');

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

router.post('/', (req, res) => {
    let { email, password } = req.body;
    
    User.findOne({email: email}, (err, doc) => {
        if(doc.use_account_status !=='valid') return res.send('please, validate your email address first');
        if(err) return console.log(err);
        
        // Checking if the user exists
        if(doc){
            bcrypt.compare(password, doc.password, (err, result) => {
                if(err) return console.log(err);
                if(result==true){
                    //Redirect to Dashboard
                    res.send('Dashboard')
                }else{
                    res.send('email and/or password incorrect!');
                }
            });
        }else{
            res.send('email and/or password incorrect!');
        }
    });
})

module.exports = router;