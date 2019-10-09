const mongoose = require('mongoose');

//This is the collection containing the information about registered users and their session.
//It is importnat to keep track their session.
var userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    password: String,
    use_account_status: String,
    token: String,
    token_expire: String,
    registration_time: String,
    session:[{
      timestamp: Date,
      webbrowser: String,
      location: String
    }] 
});

module.exports = mongoose.model("User", userSchema);