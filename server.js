const express = require('express');
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

app.get('/members', (req, res) => {
  res.sendFile(__dirname + '/views/members.html')
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

var userSchema = new mongoose.Schema({
  meeting_name: String,
  session_name: String,
  session_description: String,
  date_created: Date,
  date_rencontre: [Date],   // <---- getting a bit confused with this. meeting frequency, exact date of meeting, last meeting date
  cautisation_amount: Number, // Cautisation par seance - Ce que chaque membre doit donner par seance
  members: [{ 
    name: String, 
    profession: String, 
    city: String,
    cautisation: [{ 
      date: Date,
      amount: Number
    }],
    epargne: [{ 
      date: Date,
      amount: Number
    }],
    bouffe: { type: Boolean, default: false },  // Pour savoir si ce membre a deja bouffe
    status: {type: String, default: 'Membre'},  // Peut etre president, secretaire, tresorie...
    ordre_bouffe: Number, // Position de bouffe [date, position]      <----------------------------------------
    ordre_reception: Number  // Position de reception  [date, position]    <---------------------------------------
  }],
  seances: [{
    date: Date,
    presence: [String], //Liste de tous les membres present par seance
    rapport: String
  }]
});

var User = mongoose.model("User", userSchema);
  
// End point Create a new user
app.post('/api/newsession', (req, res) => {

  //I ve use the trim to remove empty space after the meeting_name, so "name" will be the same with "name " 
  let meeting_name = req.body.meeting_name.trim();
  User.findOne({meeting_name: meeting_name}, (err, doc) => {
    
    if(err) return console.log(err);
    if(doc) return res.send('Existe deja, Change de nom');
    
    var human = new User({
      meeting_name : meeting_name,
      session_name: req.body.session_name,
      session_description: req.body.session_description,
      date_created: Date(Date.now) 
    });

    human.save((err, human) => {
      if(err) return console.log(err); 
        res.json(human);
    });
    
  });

});

app.post('/api/adduser', (req, res) => {   
    
  {User.findOneAndUpdate({_id: req.body.id}, {$push:{members: { name: req.body.name.trim(), profession: req.body.profession.trim(), city: req.body.city.trim()}}}, {new: true}, (err, doc) => {
    if (err) return  res.send(err);
    if(doc) return res.send(doc);
    if(!doc) return res.send('Reunion inexistante');
  })}

});

// Get the list of all users
app.get('/api/allsession', function(req, res) {
  User.find({}, function(err, users) {
    if(err) return console.log(err);
    
    var sessionMap = [];
    users.forEach((el) => {
      sessionMap.push({id: el._id, meeting_name: el.meeting_name, date_created: el.date_created, members: el.members});
    });
    
    res.send(sessionMap);  
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