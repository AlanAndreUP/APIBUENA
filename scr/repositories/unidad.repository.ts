import Unidad, { IUnidad } from '../models/unidadSchema';

export const getAllUnidades = async (): Promise<IUnidad[]> => {
    return await Unidad.find();
};

export const getUnidadByPlaca = async (placa: string): Promise<IUnidad | null> => {
    return await Unidad.findOne({ placa });
};

export const getUnidadesByKitId = async (_idKit: string): Promise<IUnidad[]> => {
    return await Unidad.find({ _idKit });
};

export const createUnidad = async (unidadData: IUnidad): Promise<IUnidad> => {
    const nuevaUnidad = new Unidad(unidadData);
    return await nuevaUnidad.save();
};

export const updateUnidadByPlaca = async (placa: string, unidadData: Partial<IUnidad>): Promise<IUnidad | null> => {
    return await Unidad.findOneAndUpdate({ placa }, unidadData, { new: true });
};

export const deleteUnidadById = async (id: string): Promise<IUnidad | null> => {
    return await Unidad.findByIdAndDelete(id);
};
