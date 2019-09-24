const mongoose = require('mongoose');

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

  module.exports = mongoose.model("Reunion", reunionSchema);  