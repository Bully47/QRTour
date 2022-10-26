const mongoose = require('mongoose');

const parcoursSchema = new mongoose.Schema({
  points: {
    type: Array
  },
  name: {
    type: String
  }
});

const parcours = mongoose.model('parcours', parcoursSchema);

module.exports = parcours;
