const mongoose = require('mongoose');
const citaSchema  = new mongoose.Schema({
  id: Number,
  nombre: String,
  email: String,
});

const Cita = mongoose.model('Cita', citaSchema);
module.exports = Cita;
