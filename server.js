const express = require('express');
//const session = require('express-session'); //Manage session
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


//First check the current session and decide upon whether the request should be routed to the index or to
// the login page.
app.get('/', (req, res) => {res.sendFile(__dirname + '/views/login.html')});
app.get('/forgot-password', (req, res) => {res.sendFile(__dirname + '/views/forgot-password.html')});
app.get('/register', (req, res) => {res.sendFile(__dirname + '/views/register.html')});
app.get('/404',  (req, res) => {res.sendFile(__dirname + '/views/pages/404.html')});
app.get('/in', (req, res) => {res.sendFile(__dirname + '/views/dashboard/dashboard.html')});

app.get('/testApp', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

var reunionSchema = new mongoose.Schema({
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
    phoneNumber: String,
    epargne: [
      { 
        date: Date,
        amount: Number
      }
    ],
    bouffe: { type: Boolean, default: false },  // Pour savoir si ce membre a deja bouffe (ok)
    status: String,  // Peut etre president, secretaire, tresorie... SD: fait maintenant reference à l'objet type membre le rendre plus dynamique. 
    ordre_bouffe: Number, // Position de bouffe [date, position] (ok)
    ordre_reception: Number  // Position de reception  [date, position] (ok)
  }],
  typeMembre: [
    {
      name : String,
      description : String
    }
  ],
  seances: [{
    date: Date,
    presence: [
      { 
        personId  : String,
        aCotise   : { type: Boolean, default: false }
      }
    ], //Liste de tous les membres present par seance
    rapport: String //Fait reference à un lien où le rapport est stocké.
  }]
});

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

var Reunion = mongoose.model("Reunion", reunionSchema);
var Admin = mongoose.model("User", adminSchema);
  
// End point Create a new Tontine (Session)
app.post('/api/newsession', (req, res) => {

  //I ve use the trim to remove empty space after the meeting_name, so if the user type "name  ", it will trim to "name"
  let meeting_name = req.body.meeting_name.trim();
  Reunion.findOne({meeting_name: meeting_name}, (err, doc) => {
    
    if(err) return console.log(err);
    if(doc) return res.send('Existe deja, Change de nom');
    
    var human = new Reunion({
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

// adding a member to a Tontine (session)
app.post('/api/adduser', (req, res) => {   
    
  {Reunion.findOneAndUpdate({_id: req.body.id}, {$push:{members: { name: req.body.name.trim(), profession: req.body.profession.trim(), 
    phoneNumber: req.body.phoneNumber.trim(), city: req.body.city.trim()}}}, {new: true}, (err, doc) => {
    if (err) return  res.send(err);
    if(doc) return res.send(doc);
    if(!doc) return res.send('Reunion inexistante');
  })}

});

// Get the list of all users
app.get('/api/allsession', function(req, res) {
  Reunion.find({}, function(err, users) {
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
  // return next({status: 404, message: 'not found'})
  
  // Display the 404 pages when status is 404
  res.status(404);
  res.redirect('/404');
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