const mongoose = require('mongoose');
const publicacionesSchema = new mongoose.Schema({
  id: Number,
  título: String,
  contenido: String,
  fecha_creación: Date,
  usuario_id: Number,
});

const publicaciones = mongoose.model('publicaciones', publicacionesSchema);
module.exports = publicaciones;
