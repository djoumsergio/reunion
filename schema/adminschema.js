const mongoose = require('mongoose');

//This is the collection containing the information about registered users and their session.
//It is importnat to keep track their session.
var adminSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    use_account_status: String,
    token: String,
    token_expire: String,
    session:[{
      timestamp: Date,
      webbrowser: String,
      location: String
    }] 
});

module.exports = mongoose.model("User", adminSchema);