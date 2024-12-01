import { Router } from 'express';
import { kitController } from '../controllers';

const router = Router();

router.get('/', kitController.getAllKits);
router.get('/:_idConductor', kitController.getKitsByConductor);
router.get('/:_idKit/gps/historial', kitController.getKitGpsHistory);
router.get('/gps/historial', kitController.getGpsHistorialSummary);
router.post('/kit', kitController.createNewKit);
router.put('/:_idKit/gps', kitController.updateGpsLocation);

export default router;
