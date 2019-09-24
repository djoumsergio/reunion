const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var newSession = require('./routes/newsession');
var addUser = require('./routes/adduser');
var listAllSession = require('./routes/listallsession')

const cors = require('cors');

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

app.get('/testApp', (req, res) => {res.sendFile(__dirname + '/views/index.html')});

// From the routes folders
app.use('/api/newsession', newSession);
app.use('/api/adduser', addUser);
app.use('/api/listallsession', listAllSession);


// Not found middleware - Display the 404 pages when status is 404
app.use((req, res, next) => {
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