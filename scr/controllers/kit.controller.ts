import { Request, Response } from 'express';
import { Worker } from 'worker_threads';

const runWorker = (action: string, data: any) => {
    return new Promise<any>((resolve, reject) => {
        const worker = new Worker('../workers/kit.worker.ts');
        worker.postMessage({ action, ...data });

        worker.on('message', (message) => {
            if (message.success) {
                resolve(message.data); 
            } else {
                reject(new Error(message.error)); 
            }
            worker.terminate(); 
        });

        worker.on('error', (error:any) => {
            reject(error);
            worker.terminate();
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
};

export const getAllKits = async (req: Request, res: Response) => {
    try {
        const kits = await runWorker('getAllKits', {});
        res.json(kits);
    } catch (error:any) {
        res.status(500).json({ message: 'Error al obtener los kits', error: error.message });
    }
};

export const getKitsByConductor = async (req: Request, res: Response) => {
    try {
        const { _idConductor } = req.params;
        const kits = await runWorker('getKitsByConductor', { _idConductor });
        if (!kits) return res.status(400).json({ message: 'No se encontraron kits para este conductor' });
        return res.status(200).json(kits);
    } catch (error:any) {
        res.status(500).json({ message: 'Error al obtener los kits', error: error.message });
    }
};

export const getKitGpsHistory = async (req: Request, res: Response) => {
    try {
        const { _idKit } = req.params;
        const historial = await runWorker('getKitGpsHistory', { _idKit });
        if (!historial) return res.status(400).json({ message: 'No se encontró el historial' });
        return res.status(200).json(historial);
    } catch (error:any) {
        res.status(500).json({ message: 'Error al obtener el historial de ubicaciones', error: error.message });
    }
};

export const getGpsHistorialSummary = async (req: Request, res: Response) => {
    try {
        const summary = await runWorker('getGpsHistorialSummary', {});
        if (!summary) return res.status(400).json({ message: 'No se encontraron kits o historiales' });
        return res.status(200).json({ unidades: summary });
    } catch (error:any) {
        res.status(500).json({ message: 'Error obteniendo el historial de ubicaciones', error: error.message });
    }
};

export const createNewKit = async (req: Request, res: Response) => {
    try {
        const { apodo, _idPropietario } = req.body;
        const kit = await runWorker('createNewKit', { apodo, _idPropietario });
        return res.status(201).json(kit);
    } catch (error:any) {
        res.status(500).json({ message: 'Error creando el kit', error: error.message });
    }
};

export const updateGpsLocation = async (req: Request, res: Response) => {
    try {
        const { _idKit } = req.params;
        const nuevaUbicacion = { lat: 16.61426326662699, long: -93.09143637959407, fecha: new Date() };
        const kit = await runWorker('updateGpsLocation', { _idKit, nuevaUbicacion });
        if (!kit) return res.status(400).json({ message: 'No se encontró el kit' });
        return res.status(200).json(kit);
    } catch (error:any) {
        res.status(500).json({ message: 'Error actualizando el kit', error: error.message });
    }
};
