import { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import jwt from 'jsonwebtoken';
import Kit, { IKit, IUbicacion } from "../models/kitSchema";
import { Types } from 'mongoose';

const router = Router();

interface IHistorialUnidad {
    _idKit: Types.ObjectId | string;
    historial: Array<{ lat: number, long: number, fecha: Date }>;
}

interface IKitRequest extends Request {
    user?: IKit & { id: string };
}

const authenticateToken: RequestHandler = (req: IKitRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No se proporciono token' });

    jwt.verify(token, (process.env.JWT_SECRET ?? 'XDEJUEMPLO'), (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const kits = await Kit.find();
        res.json(kits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los kits', error });
    }
});

router.get('/:_idConductor', authenticateToken, async (req: Request, res: Response) => {
    try{
        const kits = await Kit.find({ _idConductor: req.params._idConductor });
        if(!kits) return res.status(400).json({ message: 'No se encontraron kits para este conductor' });

        return res.status(200).json(kits);
    } catch (error) {
        
    } 
});

router.get("/:_idKit/gps/historial", authenticateToken, async (req: Request, res: Response) => {
    try {
        if(!req.params._idKit) return res.status(400).json({ message: 'No se envio el id del kit' });
        const historial = await Kit.findById(req.params._idKit).select('ubicaciones');
        if(!historial) return res.status(400).json({ message: 'No se encontro el historial' });
        return res.status(200).json(historial);
    } catch (error) {
        
    }
});

router.get('/gps/historial', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { ubicacionUsuario } = req.body;
        if (!ubicacionUsuario || !('lat' in ubicacionUsuario) || !('long' in ubicacionUsuario)) {
            return res.status(400).json({ message: 'Ubicación de usuario inválida' });
        }

        const kits = await Kit.find();
        if (!kits) return res.status(400).json({ message: 'No se encontraron kits' });

        const fechaUsuario = new Date();
        const fechaUnaHoraAntes = new Date(fechaUsuario.getTime() - (60 * 60 * 1000)); // 1 hora antes

        let unidades: IHistorialUnidad[] = [];

        kits.forEach(kit => {
            if (!kit.ubicacion) return;
            if (!kit.historial) return;

            let historial: IUbicacion[] = [];
            kit.historial.forEach(ubi => {
                if (!kit.ubicacion) return;
                if (!kit.historial) return;

            let historial: Array<{ lat: number, long: number, fecha: Date }> = [];
            kit.historial.forEach(ubi => {
                if (!ubi.lat || !ubi.long) return;
                const fechaUbi = new Date(ubi.fecha);
                if (fechaUbi >= fechaUnaHoraAntes && fechaUbi <= fechaUsuario) {
                    historial.push({ lat: ubi.lat, long: ubi.long, fecha: ubi.fecha });
                }
            });

            if (historial.length > 0) {
                unidades.push({ _idKit: kit._id, historial });
            }
        })
    });

        return res.status(200).json(unidades);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo el historial de GPS', error });
    }
});

router.post('/kit', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { apodo } = req.body;
        if(!apodo) {
            const kit = new Kit({apodo: "default", _idPropietario: req.body._idPropietario});
            await kit.save();
            return res.status(201).json(kit);
        }

        const kit = new Kit({apodo: apodo, _idPropietario: req.body._idPropietario});
        await kit.save();
        return res.status(201).json(kit);
    } catch (error) {
        return res.status(500).json({ message: 'Error creando el kit', error });
    }
})

router.put('/:_idKit/gps', async (req: Request, res: Response) => {
    try {
        if(!req.params._idKit) return res.status(400).json({ message: 'No se envio el id del kit' });
        const { ubicacion } = req.body;
        if(!ubicacion) return res.status(400).json({ message: 'No se envio la ubicacion' });
        const kit = await Kit.findByIdAndUpdate(req.params._idKit, { 
            $push: { ubicaciones: ubicacion } }, { new: true, upsert: true });

        if(!kit) return res.status(400).json({ message: 'No se encontro el kit' });

        return res.status(200).json(kit);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error actualizando el kit', error });
    }
});

export default router;

