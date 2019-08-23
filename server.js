const express = require('express');
const mongo = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var request = require('request');

const cors = require('cors');

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });

mongoose.set('useFindAndModify', false);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

var userSchema = new mongoose.Schema({
  username : String
});

var User = mongoose.model("User", userSchema);
  
// End point Create a new user
app.post('/adduser', (req, res) => {

  User.findOne({username: req.body.username}, (err, doc) => {
    
    if(err) return console.log(err);
    if(doc) return res.send('username already taken');
    
    var human = new User({
      username : req.body.username,
    });

    human.save((err, human) => {
      if(err) return console.log(err); 
        res.json({"username": human.username, "_id": human.id});
    });
    
  });

});

// Get the list of all users
app.get('/api/exercise/users', function(req, res) {
  User.find({}, function(err, users) {
    if(err) return console.log(err);
    
    var userMap = [];
    users.forEach((element) => {
      userMap.push({id: element._id, username: element.username});
    });
    
    res.send(userMap);  
  });
});



// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})