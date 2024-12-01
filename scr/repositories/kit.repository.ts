import Kit, { IKit, IUbicacion } from "../models/kitSchema";

export const findAllKits = async () => {
    return await Kit.find();
};

export const findKitById = async (id: string) => {
    return await Kit.findById(id).select('ubicaciones');
};

export const findKitsByConductor = async (conductorId: string) => {
    return await Kit.find({ _idConductor: conductorId });
};

export const updateKitLocation = async (_idKit: string, nuevaUbicacion: IUbicacion) => {
    return await Kit.findByIdAndUpdate(
        _idKit,
        {
            $set: { ubicacion: nuevaUbicacion },
            $push: { historial: nuevaUbicacion },
        },
        { new: true, upsert: true }
    );
};

export const createKit = async (apodo: string, propietarioId: string) => {
    const kit = new Kit({ apodo, _idPropietario: propietarioId });
    return await kit.save();
};