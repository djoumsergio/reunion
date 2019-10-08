const express = require('express');
const app = express();
var router = express.Router();
const mongoose = require('mongoose');

mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/tontine', { useNewUrlParser: true });

mongoose.set('useFindAndModify', false);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

var Reunion = require('./../schema/reunionschema');
  
// End point Create a new Tontine (Session)
// adding a member to a Tontine (session)
// Get the list of all sessions
router.get('/', function(req, res) {
    Reunion.find({}, function(err, users) {
      if(err) return console.log(err);
      
        var sessionMap = [];
         users.forEach((el) => {
            sessionMap.push({id: el._id, meeting_name: el.meeting_name, date_created: el.date_created, members: el.members});
        });
      
      res.send(sessionMap);  
    });
});

module.exports = router;