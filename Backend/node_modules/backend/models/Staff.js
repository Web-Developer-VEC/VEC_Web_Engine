const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String, required: true },
  designation: { type: String, required: true },
});

module.exports = mongoose.model('Staff', staffSchema, 'Faculties');
