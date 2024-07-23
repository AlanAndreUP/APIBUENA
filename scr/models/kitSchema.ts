import { Schema, model } from 'mongoose';

export interface IUbicacion {
    fecha: Date;
    lat: number;
    long: number;
}

export interface IKit{
    apodo: string;
    ubicacion?: IUbicacion;
    historial?: IUbicacion[];
    rostrosReconocidos?: {
        idRandom: string;
        permanecio: boolean;
        fechaHora: Date;
    }[];
    _idPropietario: Schema.Types.ObjectId[];
}

const IUbicacionSchema = new Schema<IUbicacion>({
    fecha: {
        type: Date,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    }
});

const kitSchema = new Schema<IKit>({
    apodo: {
        type: String,
        required: true
    },
    ubicacion: IUbicacionSchema,
    historial: [IUbicacionSchema],
    rostrosReconocidos: [{
        idRandom: {
            type: String            
        },
        permanecio: {
            type: Boolean, default: false         
        },
        fechaHora: {
            type: Date            
        }
    }],
    _idPropietario: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuarios'
    }]
});

const Kit = model<IKit>('Kits', kitSchema)

export default Kit