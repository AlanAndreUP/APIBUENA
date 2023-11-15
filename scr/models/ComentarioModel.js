const mongoose = require('mongoose');

  const comentariosSchema = new mongoose.Schema({
    id: Number,
    contenido: String,
    fecha_creación: Date,
    publicación_id: Number,
    usuario_id: Number,
  });

  const Comentarios = mongoose.model('Comentarios', comentariosSchema);
module.exports = Comentarios;
