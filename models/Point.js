const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  cp: {
    type: String
  },
  description: {
    type: String
  },
  descriptionHTML: {
    type: String
  },
  avatar: {
    type: String
  },
  position: {
    type: Object
  }
});

const point = mongoose.model('point', pointSchema);

module.exports = point;
