import { Schema, model } from 'mongoose';

interface IKit{
    apodo: string;
    ubicacion: {
        lat: number;
        long: number;
    }
    rostrosReconocidos?: {
        idRandom: string;
        permanecio: boolean;
        fechaHora: Date;
    }[];
    _idConductores?: Schema.Types.ObjectId[];
    gananciasTotales: () => number;   
}

const kitSchema = new Schema<IKit>({
    apodo: {
        type: String,
        required: true
    },
    ubicacion: {
        lat: {
            type: Number,
            required: true
        },
        long: {
            type: Number,
            required: true
        }
    },
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
    _idConductores: [{
        type: Schema.Types.ObjectId,
        ref: 'Usuarios'
    }]
});

const Kit = model<IKit>('Kits', kitSchema)

export default Kit