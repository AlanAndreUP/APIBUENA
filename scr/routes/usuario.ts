import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuario } from '../models/usuarioSchema';
import Kit from '../models/kitSchema';

const router = express.Router();
let JWT_SECRET = process.env.JWT_SECRET ?? 'XDEJUEMPLO';

interface IUserRequest extends Request {
    user?: IUsuario & { id: string };
}

const authenticateToken: RequestHandler = (req: IUserRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

router.post('/create', async (req: Request, res: Response) => {
    const { nombre, correo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Usuario<IUsuario>({ nombre:nombre, correo:correo, password: hashedPassword, tipo: 'admin' });
        await newUser.save();
        res.status(201).json({ message: 'Administrador registrado exitosamente', data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando el usuario', error });
    }
})

router.post('/register', async (req: Request, res: Response) => {
    const { nombre, correo, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Usuario<IUsuario>({ nombre:nombre, correo:correo, password: hashedPassword, tipo: 'cliente' });
        await newUser.save();
        res.status(201).json({ message: 'Cliente registrado exitosamente', data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando el usuario', error });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { correo, password } = req.body;

    try {
        const user = await Usuario.findOne({ correo });
        if (!user) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Correo o contraseña incorrectos' });

        const token = jwt.sign({ id: user._id, tipo: user.tipo }, "XDEJUEMPLO", { expiresIn: '1h' });
        return res.status(201).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el inicio de sesión', error });
    }
});

router.put('/update', async (req: IUserRequest, res: Response) => {
    const { nombre, correo } = req.body;
    const userId = req.user?.id;

    try {
        await Usuario.findByIdAndUpdate(userId, { nombre, correo });
        res.json({ message: 'Información actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando la información', error });
    }
});

router.put('/change-password', authenticateToken, async (req: IUserRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    try {
        const user = await Usuario.findById(userId);
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Contraseña actual incorrecta' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error cambiando la contraseña', error });
    }
});

router.put('/update-horarios', async (req: IUserRequest, res: Response) => {
    const { horarios } = req.body;
    const userId = req.user?.id;

    try {
        await Usuario.findByIdAndUpdate(userId, { 'choferInfo.horarios': horarios });
        res.json({ message: 'Horarios actualizados exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando los horarios', error });
    }
});

router.get('/info/:_id', async (req: IUserRequest, res: Response) => {
    const _id = req.params;

    try {
        const user = await Usuario.findById(_id).select('-password');
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado ' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo la información del conductor', error });
    }
});

router.get('/drivers', async (req: IUserRequest, res: Response) => {
    try {
        const drivers = await Usuario.find({ tipo: 'conductor' }).select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los conductores', error });
    }
});

router.get('/viajes', async (req: IUserRequest, res: Response) => {
    const userId = req.user?.id;

    try {
        const user = await Usuario.findById(userId);
        if (!user || user.tipo !== 'conductor') return res.status(400).json({ message: 'Usuario no es un conductor' });

        const viajes = user.choferInfo?.totalViajes ?? 0;
        res.json({ viajes });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los viajes', error });
    }
});

export default router;
