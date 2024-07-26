import express, { Request, Response } from 'express';
import Unidad, { IUnidad } from '../models/unidadSchema';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const unidades = await Unidad.find();
        return res.status(200).json(unidades);
    } catch (error) {
        return res.status(500).json({ message: 'Error obteniendo las unidades', error });
    }
});

router.get('/unidad/:placa', async (req: Request, res: Response) => {
    const { placa } = req.params;

    try {
        const unidad = await Unidad.find({ placa: placa });
        if (!unidad) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json(unidad);
    } catch (error) {
        return res.status(500).json({ message: 'Error obteniendo la unidad', error });
    }
});

router.post('/', async (req: Request, res: Response) => {
    const { placa, modelo, chofer, activo, _idKit } = req.body;

    try {
        const nuevaUnidad = new Unidad<IUnidad>({ placa, modelo, chofer, activo, _idKit });
        await nuevaUnidad.save();
        return res.status(201).json({ message: 'Unidad creada exitosamente', unidad: nuevaUnidad });
    } catch (error) {
        return res.status(500).json({ message: 'Error creando la unidad', error });
    }
});


router.put('/unidad/:placaId', async (req: Request, res: Response) => {
    const { placaId } = req.params;
    if(!placaId) return res.status(400).json({ message: 'No se envió la placa de la unidad' });
    const { placa, modelo, chofer, activo, _idKit } = req.body;

    try {
        const unidadActualizada = await Unidad.findOneAndUpdate(
            { placa: placaId },  
            { placa, modelo, chofer, activo, _idKit },  
            { new: true }  
        );
        
        if (!unidadActualizada) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json({ message: 'Unidad actualizada exitosamente', unidad: unidadActualizada });
    } catch (error) {
        return res.status(500).json({ message: 'Error actualizando la unidad', error });
    }
});

router.delete('/unidad/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const unidadEliminada = await Unidad.findByIdAndDelete(id);
        if (!unidadEliminada) {
            return res.status(404).json({ message: 'Unidad no encontrada' });
        }
        return res.status(200).json({ message: 'Unidad eliminada exitosamente', unidad: unidadEliminada });
    } catch (error) {
        return res.status(500).json({ message: 'Error eliminando la unidad', error });
    }
});

export default router;
