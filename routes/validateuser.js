var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
var User = require('./../schema/userschema');
const TokenGenerator = require('uuid-token-generator');

const tokgen = new TokenGenerator(256, TokenGenerator.BASE62);

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

router.get('/', (req, res) => {
    let { fname, lname, token } = req.query;
    
    User.findOne({fname: fname, lname: lname, token: token}, (err, doc) => {
    
        if(err) return console.log(err);
        if(!doc) return res.send('Token expired');
        
        // Checking if the user exists
        if(doc){
            User.findOneAndUpdate({fname: fname, lname: lname, token: token}, {$set: {use_account_status: 'valid', token: tokgen.generate()}}, {new: true}, (err, doc) => {
                if(err) return console.log(err);
            })

            // Redirect to login page should be implemented here
            res.send('Validation complete');
        }else{
            // Redirect to error page. Something wrong -- Should be rightly implemented
            res.send('Something went wrong');
        }
    });
})

module.exports = router;