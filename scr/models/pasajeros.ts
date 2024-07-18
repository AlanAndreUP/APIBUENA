// models/pasajerosPorDiaSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IPasajerosPorDia extends Document {
    fecha: string;
    cantidad: number;
}

const pasajerosPorDiaSchema: Schema = new Schema({
    fecha: { type: String, required: true, unique: true },
    cantidad: { type: Number, required: true },
});

export default mongoose.model<IPasajerosPorDia>('PasajerosPorDia', pasajerosPorDiaSchema);
