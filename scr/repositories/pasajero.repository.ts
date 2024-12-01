import PasajerosPorDia from '../models/pasajeros';
import { startOfDay, endOfDay } from 'date-fns';

export const savePassengerData = async (fecha: string, cantidad: number) => {
  let pasajeros = await PasajerosPorDia.findOne({ fecha });
  if (pasajeros) {
    pasajeros.cantidad += cantidad;
  } else {
    pasajeros = new PasajerosPorDia({ fecha, cantidad });
  }
  await pasajeros.save();
};

export const findPassengerByDate = async (fecha: string) => {
  return await PasajerosPorDia.findOne({ fecha });
};

export const calculateEarningsForDateRange = async (
  fechaInicio: string,
  fechaFin: string,
  tarifa: number
) => {
  const pasajeros = await PasajerosPorDia.find({
    fecha: { $gte: fechaInicio, $lte: fechaFin },
  });

  const earningsByDay = pasajeros.reduce((acc, dia) => {
    const day = new Date(dia.fecha).getDay();
    acc[day] = (acc[day] || 0) + dia.cantidad * tarifa;
    return acc;
  }, {} as { [key: number]: number });

  return Array(7).fill(0).map((_, i) => earningsByDay[i] || 0);
};

export const calculateHourlyEarnings = async (fecha: string, tarifa: number) => {
  const currentDate = new Date(fecha);
  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(currentDate);

  const pasajeros = await PasajerosPorDia.find({
    fecha: { $gte: startDate, $lte: endDate },
  });

  return pasajeros.map(dia => ({
    hora: new Date(dia.fecha).getHours(),
    ganancias: dia.cantidad * tarifa,
  }));
};

export const calculateCurrentMonthEarnings = async (tarifa: number) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const pasajeros = await PasajerosPorDia.find({
    fecha: { $gte: startOfMonth, $lt: endOfMonth },
  });

  const gananciasTotales = pasajeros.reduce((total, dia) => total + dia.cantidad * tarifa, 0);
  return { gananciasTotales };
};
