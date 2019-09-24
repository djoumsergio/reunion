const express = require('express');
const app = express();
var router = express.Router();
const mongoose = require('mongoose');
var Reunion = require('./../schema/reunionschema');

mongoose.connect('mongodb://localhost/tontine', { useNewUrlParser: true });

mongoose.set('useFindAndModify', false);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

// End point Create a new Tontine (Session)
app.post('/', (req, res) => {

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

module.exports = router;