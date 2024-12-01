import bcrypt from 'bcrypt';
import Usuario, { IUsuario } from '../models/usuarioSchema';

export const createUser = async (userData: Partial<IUsuario>) => {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    return await Usuario.create({ ...userData, password: hashedPassword });
};

export const updateUserById = async (_id: string, updates: Partial<IUsuario>) => {
    return await Usuario.findByIdAndUpdate(_id, updates, { new: true });
};

export const deleteUserById = async (_id: string) => {
    return await Usuario.findByIdAndDelete(_id);
};

export const findUserById = async (_id: string) => {
    return await Usuario.findById(_id).select('-password');
};

export const findUserByEmail = async (correo: string) => {
    return await Usuario.findOne({ correo });
};

export const comparePasswords = async (plainPassword: string, hashedPassword: string) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export const updatePasswordById = async (_id: string, newPassword: string) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await Usuario.findByIdAndUpdate(_id, { password: hashedPassword });
};

export const findDrivers = async () => {
    return await Usuario.find({ tipo: 'cliente' }).select('-password');
};
