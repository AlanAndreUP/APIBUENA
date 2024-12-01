import express from 'express';
import { pasajeroController } from '../controllers';

const router = express.Router();



router.post('/generate', pasajeroController.generateData);
router.post('/', pasajeroController.addPassengerCount);
router.get('/', pasajeroController.getPassengerCount);
router.get('/ganancias/dia', pasajeroController.getDailyEarnings);
router.post('/ganancias/semana', pasajeroController.getWeeklyEarnings);
router.post('/ganancias/horas', pasajeroController.getHourlyEarnings);
router.get('/ganancias/mes-actual', pasajeroController.getMonthlyEarnings);

export default router;
