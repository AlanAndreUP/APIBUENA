const mongoose = require('mongoose');
const moment = require("moment-timezone");
const pacienteSchema = new mongoose.Schema({
    nombre:{
        type: String,
        required: true
    },
    apellidos:{
        type: String,
        required: true
    },
    telefono:{
        type: Number,
        required: true
    },
    correo:{
        type: String,
        required: false
    },
  
    estatusCliente:{
        type: String,
        enum: ['Activo', 'Inactivo']
    },
    password:{
        type: String,
        required: true
    }
    
});

const Paciente = mongoose.model('Pacientes', pacienteSchema);

module.exports = Paciente;
