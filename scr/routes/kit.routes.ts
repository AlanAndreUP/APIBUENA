import { Router } from 'express';
import { kitController } from '../controllers';

const router = Router();

router.get('/', kitController.getAllKits);
router.get('/:_idConductor', kitController.getKitsByConductor);
router.get('/:_idKit/gps/historial', kitController.getKitHistorial);
router.get('/gps/historial', kitController.getHistorialUnidades);
router.post('/kit', kitController.createKit);
router.put('/:_idKit/gps', kitController.updateKitGps);

export default router;
