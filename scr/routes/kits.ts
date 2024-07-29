import { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import jwt from 'jsonwebtoken';
import Kit, { IKit, IUbicacion } from "../models/kitSchema";
import { Types } from 'mongoose';
import Unidad, { IUnidad } from '../models/unidadSchema';

const router = Router();

interface IHistorialUnidad {
    _idKit: Types.ObjectId | string;
    historial: IUbicacion[];
    conductor: string;
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

router.get('/gps/historial', async (req: Request, res: Response) => {
    try {
        const fechaUsuario = new Date();
      

        let falseUsuario = new Date(fechaUsuario.getTime() - (1 * 60 * 60 * 1000))
        const fechaUnaHoraAntes = new Date(fechaUsuario.getTime() - (24 * 60 * 60 * 1000)); // 1 día antes
        let kits = await Kit.find({
            "historial.fecha": { $gte: fechaUnaHoraAntes, $lte: falseUsuario }
        })

        if (!kits || kits.length === 0) return res.status(400).json({ message: 'No se encontraron kits' });

        let unidades: IHistorialUnidad[] = [];
        const unidad = await Unidad.find({ _idKit: kits[0]._id });
        kits.forEach( kit => {
            if (!kit.historial) return;

            let historial: IUbicacion[] = kit.historial.filter(ubi => {
                const fechaUbi = new Date(ubi.fecha);
                return fechaUbi >= fechaUnaHoraAntes && fechaUbi <= fechaUsuario;
            });
              
                console.log(unidad);
                unidades.push({
                    _idKit: kit._id.toString(), historial,
                    conductor: unidad[0].chofer
                });
            
        });
        console.log(unidades);

        return res.status(200).json({ unidades });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error obteniendo el historial de ubicaciones', error });
    }
});

router.post('/kit', async (req: Request, res: Response) => {
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
        let lat = 16.61607339629603;
        let long= -93.09084688706723;

        const { _idKit } = req.params;
           
        

        const nuevaUbicacion: IUbicacion = {
            lat,
            long,
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
        console.log(error);
        return res.status(500).json({ message: 'Error actualizando el kit', error });
    }
});

export default router;

