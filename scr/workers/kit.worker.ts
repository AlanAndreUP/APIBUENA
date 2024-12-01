import { parentPort } from 'worker_threads';
import { kitRepository } from '../repositories';
import Unidad from '../models/unidadSchema';

// Procesa la solicitud de obtener kits por conductor
const getKitsByConductor = async (_idConductor: string) => {
    return await kitRepository.findKitsByConductor(_idConductor);
};

// Procesa la solicitud de obtener el historial de un kit
const getKitGpsHistory = async (_idKit: string) => {
    return await kitRepository.findKitById(_idKit);
};

// Filtra y obtiene el historial de kits en un rango de tiempo
const getGpsHistorialSummary = async () => {
    const fechaUsuario = new Date();
    const fechaUnaHoraAntes = new Date(fechaUsuario.getTime() - 24 * 60 * 60 * 1000);
    const kits = await kitRepository.findAllKits();

    if (!kits || kits.length === 0) return null;

    const unidades = await Promise.all(
        kits.map(async (kit) => {
            if (!kit.historial) return null;
            const historial = kit.historial.filter((ubi) => {
                const fechaUbi = new Date(ubi.fecha);
                return fechaUbi >= fechaUnaHoraAntes && fechaUbi <= fechaUsuario;
            });

            const unidad = await Unidad.findOne({ _idKit: kit._id });
            return unidad ? { _idKit: kit._id.toString(), historial, conductor: unidad.chofer } : null;
        })
    );

    return unidades.filter(Boolean);
};

// Recibir mensaje del hilo principal
parentPort?.on('message', async (data) => {
    try {
        let result;

        switch (data.action) {
            case 'getKitsByConductor':
                result = await getKitsByConductor(data._idConductor);
                break;
            case 'getKitGpsHistory':
                result = await getKitGpsHistory(data._idKit);
                break;
            case 'getGpsHistorialSummary':
                result = await getGpsHistorialSummary();
                break;
            default:
                throw new Error('Acción no reconocida');
        }

        parentPort?.postMessage({ success: true, data: result });
    } catch (error:any ) {
        parentPort?.postMessage({ success: false, error: error.message });
    }
});
