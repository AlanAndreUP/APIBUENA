import { Schema, model } from "mongoose";


export interface IUnidad {
    placa: string,
    modelo: string,
    chofer: string,
    _idKit: Schema.Types.ObjectId
}

const unidadSchema = new Schema<IUnidad>({
    placa: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    chofer: {
        type: String,
        required: true
    },
    _idKit: {
        type: Schema.Types.ObjectId,
        ref: 'Kits'
    }
});

export default model<IUnidad>('Unidad', unidadSchema)