import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories';

const JWT_SECRET = process.env.JWT_SECRET ?? 'XDEJUEMPLO';

export const registerUser = async (req: Request, res: Response) => {
    const { nombre, correo, password, tipo = 'cliente' } = req.body;
    try {
        const newUser = await userRepository.createUser({ nombre, correo, password, tipo });
        res.status(201).json({ message: 'Usuario registrado exitosamente', data: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando el usuario', error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { correo, password } = req.body;
    try {
        const user = await userRepository.findUserByEmail(correo);
        if (!user || !(await userRepository.comparePasswords(password, user.password))) {
            return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
        }
        const token = jwt.sign({ id: user._id, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el inicio de sesión', error });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await userRepository.findUserById(req.params._id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo la información', error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updatedUser = await userRepository.updateUserById(req.params._id, req.body);
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario actualizado', data: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando el usuario', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await userRepository.deleteUserById(req.params._id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando el usuario', error });
    }
};

export const getDrivers = async (_req: Request, res: Response) => {
    try {
        const drivers = await userRepository.findDrivers();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los conductores', error });
    }
};

export const loginByCamera = async (req: Request, res: Response) => {
    const { base64 } = req.body;
    try {
        const user = await userRepository.findUserByImagen(base64);
        if(!user) return res.status(400).json({ message: 'No se encontro el usuario' });
        const token = jwt.sign({ id: user._id, tipo: user.tipo }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el inicio de sesión', error });
    }
};
