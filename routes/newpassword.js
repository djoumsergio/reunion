var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var User = require('./../schema/userschema');
const TokenGenerator = require('uuid-token-generator');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

router.post('/', (req, res) => {
    let { token, password } = req.body;

    User.findOne({token: token}, (err, doc) => {
    
        if(err) return console.log(err);
        if(!doc) return res.send('Token expired');
        
        // Checking if the user exists
        if(doc){
            bcrypt.hash(password, saltRounds, function(err, hash){
                User.findOneAndUpdate({token: token}, {$set: {password: hash, token: tokgen.generate()}}, {new: true}, (err, doc) => {
                    if(err) return console.log(err);
                })
            });

            // Redirect to login page should be implemented here
            res.send('success');
        }else{
            // Redirect to error page. Something wrong -- Should be rightly implemented
            res.send('Something went wrong');
        }
    });
})

module.exports = router;