import { Request, Response } from 'express';
import Kit from '../models/kitSchema';
import Unidad from '../models/unidadSchema';
import { Types } from 'mongoose';

export const getAllKits = async (req: Request, res: Response) => {
    try {
        const kits = await Kit.find();
        res.json(kits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los kits', error });
    }
};

export const getKitsByConductor = async (req: Request, res: Response) => {
    try {
        const kits = await Kit.find({ _idConductor: req.params._idConductor });
        if (!kits) return res.status(400).json({ message: 'No se encontraron kits para este conductor' });
        return res.status(200).json(kits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los kits para el conductor', error });
    }
};

export const getKitHistorial = async (req: Request, res: Response) => {
    try {
        if (!req.params._idKit) return res.status(400).json({ message: 'No se envio el id del kit' });
        const historial = await Kit.findById(req.params._idKit).select('ubicaciones');
        if (!historial) return res.status(400).json({ message: 'No se encontro el historial' });
        return res.status(200).json(historial);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial del kit', error });
    }
};

export const getHistorialUnidades = async (req: Request, res: Response) => {
    try {
        const fechaUsuario = new Date();
        const fechaUnaHoraAntes = new Date(fechaUsuario.getTime() - (25 * 60 * 60 * 1000));

        let kits = await Kit.find();
        if (!kits || kits.length === 0) return res.status(400).json({ message: 'No se encontraron kits' });

        let unidades:any = [];
        const unidad = await Unidad.find({ _idKit: kits[0]._id });

        kits.forEach(kit => {
            if (!kit.historial) return;

            let historial = kit.historial.filter(ubi => {
                const fechaUbi = new Date(ubi.fecha);
                return fechaUbi >= fechaUnaHoraAntes && fechaUbi <= fechaUsuario;
            });

            unidades.push({
                _idKit: kit._id.toString(),
                historial,
                conductor: unidad[0].chofer
            });
        });

        return res.status(200).json({ unidades });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo el historial de ubicaciones', error });
    }
};

export const createKit = async (req: Request, res: Response) => {
    try {
        const { apodo, _idPropietario } = req.body;
        const kit = new Kit({ apodo: apodo || 'default', _idPropietario });
        await kit.save();
        return res.status(201).json(kit);
    } catch (error) {
        res.status(500).json({ message: 'Error creando el kit', error });
    }
};

export const updateKitGps = async (req: Request, res: Response) => {
    try {
        const { _idKit } = req.params;
        const nuevaUbicacion = {
            lat: 16.61426326662699,
            long: -93.09143637959407,
            fecha: new Date()
        };

        const kit = await Kit.findByIdAndUpdate(
            _idKit,
            {
                $set: { ubicacion: nuevaUbicacion },
                $push: { historial: nuevaUbicacion }
            },
            { new: true, upsert: true }
        );

        if (!kit) return res.status(400).json({ message: 'No se encontró el kit' });
        return res.status(200).json(kit);
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando el kit', error });
    }
};
