import { Router } from 'express';
import { unidadController } from '../controllers';

const router = Router();

router.get('/', unidadController.getAllUnidades);
router.get('/unidad/:placa', unidadController.getUnidadByPlaca);
router.get('/kit/:_idKit', unidadController.getUnidadesByKitId);
router.post('/', unidadController.createUnidad);
router.put('/unidad/:placaId', unidadController.updateUnidadByPlaca);
router.delete('/unidad/:id', unidadController.deleteUnidadById);

export default router;
