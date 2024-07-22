import { Schema, model } from "mongoose";

export interface IChoferInfo {
    totalViajes: number;
    viajesDiarios: { [key: string]: number }; 
    horarios: {
        salida: string;
        llegada: string;
    }[];
    incidentes: {
        fechaHora: Date;
        descripcion: string;
    }[];
    rating: {
        total: number;
        cantidad: number;
    };
}

export interface IUsuario {
    nombre: string;
    correo: string;
    password: string;
    tipo: 'cliente' | 'conductor' | 'admin';
    choferInfo?: IChoferInfo;
}

const usuarioSchema = new Schema<IUsuario>({
    nombre:{
        type: String,
        required: true
    },
    correo:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    tipo:{
        type: String,
        enum: ['cliente', 'conductor', 'admin'],
        required: true
    },
    choferInfo: {
        totalViajes: { type: Number, default: 0 },
        viajesDiarios: { type: Map, of: Number, default: {} },
        horarios: [{
            salida: { type: String, required: true },
            llegada: { type: String, required: true }
        }],
        incidentes: [{
            timestamp: { type: Date, default: Date.now },
            descripcion: { type: String, required: true }
        }],
        rating: {
            total: { type: Number, default: 0 },
            cantidad: { type: Number, default: 0 }
        }
    }
});

const Usuario = model('Usuarios', usuarioSchema);

export default Usuario;
    