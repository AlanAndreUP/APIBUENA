import express from 'express';
import { userController } from '../controllers';

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/image', userController.loginByCamera);
router.get('/info/:_id', userController.getUserById);
router.put('/update/:_id', userController.updateUser);
router.delete('/delete/:_id', userController.deleteUser);
router.get('/drivers', userController.getDrivers);

export default router;
