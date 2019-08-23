const express = require('express');
const mongo = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var request = require('request');

const cors = require('cors');

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', { useNewUrlParser: true });

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
  username : String,
  log: [{
    description: String,
    duration: Number,
    date: String
  }]
});

var User = mongoose.model("User", userSchema);
  
// End point Create a new user
app.post('/api/exercise/new-user', (req, res) => {

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

// Add exercises
app.post('/api/exercise/add', (req, res) => {
  
  var theDate;
  
  // Formating date when date input is empty
  if(!req.body.date){
    theDate = (new Date(Date.now())).toString().slice(0, 15);
    // console.log(theDate);
  }
  
  if(req.body.date){
    var l = req.body.date;
    
    // Check and convert the Date field
    request('https://timestamp-microservice-fcc-aris.glitch.me/api/timestamp/'+ l, function (error, response, body) {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      theDate = JSON.parse(body);
      theDate = theDate.utc.slice(0,15);
      
      // Do this when the date is not valid
      if(!JSON.parse(body).unix){
        return res.send(`Cast to Date failed for value "${req.body.date}" at path "date"`);
      }
    })
  }
  
  // I am using a setTimeout here to wait for the request function to finish setting the value theDate, without this theDate is undefined
  setTimeout(() => {User.findOneAndUpdate({_id: req.body.userId}, {$push:{log: {duration: req.body.duration, description: req.body.description, date: theDate}}}, {new: true}, (err, doc) => {
    if (err) return  res.send('unknown _id');
    if(doc) return res.send({"username": doc.username, "description": req.body.description, "duration": req.body.duration,"_id": doc._id, "date": theDate});
    if(!doc) return res.send('unknown _id');
    
  })}, 1000);
  
});

// get user exercises log
app.get('/api/exercise/log',(req, res) => {

  User.findById({_id: req.query.userId}, (err, doc) => {
    if(err) return console.log(err);
    
    var myLog = [];
        
    doc.log.forEach((element) => {
      myLog.push({description: element.description, duration: element.duration, date: element.date})
    });
    
    res.send({_id: doc.id, username: doc.username, count: doc.log.length, log: myLog});

  })
  
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