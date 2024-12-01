import { Request, Response } from 'express';
import { unidadRepository } from '../repositories';

export const getAllUnidades = async (req: Request, res: Response) => {
    try {
        const unidades = await unidadRepository.getAllUnidades();
        return res.status(200).json(unidades);
    } catch (error) {
        return res.status(500).json({ message: 'Error obteniendo las unidades', error });
    }
};

export const getUnidadByPlaca = async (req: Request, res: Response) => {
    const { placa } = req.params || {};
    try {
        const unidad = await unidadRepository.getUnidadByPlaca(placa!);
        if (!unidad) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json(unidad);
    } catch (error) {
        return res.status(500).json({ message: 'Error obteniendo la unidad', error });
    }
};

export const getUnidadesByKitId = async (req: Request, res: Response) => {
    const { _idKit } = req.params || {};
    try {
        const unidades = await unidadRepository.getUnidadesByKitId(_idKit!);
        if (unidades.length === 0) {
            return res.status(404).json({ message: 'Unidades no encontradas' });
        }
        return res.status(200).json(unidades);
    } catch (error) {
        return res.status(500).json({ message: 'Error obteniendo las unidades', error });
    }
};

export const createUnidad = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const nuevaUnidad = await unidadRepository.createUnidad(body);
        return res.status(201).json({ message: 'Unidad creada exitosamente', unidad: nuevaUnidad });
    } catch (error) {
        return res.status(500).json({ message: 'Error creando la unidad', error });
    }
};

export const updateUnidadByPlaca = async (req: Request, res: Response) => {
    const { placaId } = req.params || {};
    try {
        const body = req.body;
        const unidadActualizada = await unidadRepository.updateUnidadByPlaca(placaId!, body);
        if (!unidadActualizada) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json({ message: 'Unidad actualizada exitosamente', unidad: unidadActualizada });
    } catch (error) {
        return res.status(500).json({ message: 'Error actualizando la unidad', error });
    }
};

export const deleteUnidadById = async (req: Request, res: Response) => {
    const { id } = req.params || {};
    try {
        const unidadEliminada = await unidadRepository.deleteUnidadById(id!);
        if (!unidadEliminada) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json({ message: 'Unidad eliminada exitosamente', unidad: unidadEliminada });
    } catch (error) {
        return res.status(500).json({ message: 'Error eliminando la unidad', error });
    }
};
