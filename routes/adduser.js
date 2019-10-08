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
router.post('/', (req, res) => {   
    
    {Reunion.findOneAndUpdate({_id: req.body.id}, {$push:{members: { name: req.body.name.trim(), profession: req.body.profession.trim(), 
      phoneNumber: req.body.phoneNumber.trim(), city: req.body.city.trim()}}}, {new: true}, (err, doc) => {
      if (err) return  res.send(err);
      if(doc) return res.send(doc);
      if(!doc) return res.send('Reunion inexistante');
    })}
  
});

module.exports = router;