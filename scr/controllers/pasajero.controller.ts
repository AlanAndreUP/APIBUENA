import { Request, Response } from 'express';
import { pasajerosRepository } from '../repositories';
import signale from 'signale';
import { formatISO, startOfDay, endOfDay, subDays, addMinutes } from 'date-fns';

const TARIFA_POR_PASAJERO = 20;

export const generateData = async (req: Request, res: Response) => {
  const { fecha } = req.body;
  if (!fecha) return res.status(400).json({ message: 'Fecha es requerida' });

  try {
    const endDate = new Date(fecha);
    const startDate = subDays(startOfDay(endDate), 7);

    let currentDate = startDate;
    while (currentDate < endDate) {
      let currentTime = new Date(currentDate.setHours(7, 0, 0, 0));
      const endTime = new Date(currentDate.setHours(22, 0, 0, 0));

      while (currentTime <= endTime) {
        const cantidad = Math.floor(Math.random() * 31);
        signale.info(`Generando cantidad ${cantidad} para fecha ${formatISO(currentTime)}`);

        await pasajerosRepository.savePassengerData(formatISO(currentTime), cantidad);

        currentTime = addMinutes(currentTime, 15);
      }

      currentDate = addMinutes(new Date(currentDate.setHours(0, 0, 0, 0)), 24 * 60);
    }

    res.status(201).json({ message: 'Datos generados y registrados exitosamente' });
  } catch (error) {
    signale.error(error);
    res.status(500).json({ message: 'Error generando los datos', error });
  }
};

export const addPassengerCount = async (req: Request, res: Response) => {
  const { fecha, cantidad } = req.body;
  try {
    await pasajerosRepository.savePassengerData(fecha, cantidad);
    res.status(201).json({ message: 'Cantidad de pasajeros registrada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error registrando la cantidad de pasajeros', error });
  }
};

export const getPassengerCount = async (req: Request, res: Response) => {
  const { fecha } = req.query;
  try {
    const pasajeros = await pasajerosRepository.findPassengerByDate(fecha as string);
    if (!pasajeros) return res.status(400).json({ message: 'No se encontraron registros para la fecha proporcionada' });

    res.status(200).json(pasajeros);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo la cantidad de pasajeros', error });
  }
};

export const getDailyEarnings = async (req: Request, res: Response) => {
  const { fecha } = req.query;
  try {
    const pasajeros = await pasajerosRepository.findPassengerByDate(fecha as string);
    if (!pasajeros) return res.status(400).json({ message: 'No se encontraron registros para la fecha proporcionada' });

    const ganancias = pasajeros.cantidad * TARIFA_POR_PASAJERO;
    res.json({ fecha: pasajeros.fecha, ganancias });
  } catch (error) {
    res.status(500).json({ message: 'Error calculando las ganancias diarias', error });
  }
};

export const getWeeklyEarnings = async (req: Request, res: Response) => {
  const { fechaInicio, fechaFin } = req.body;
  try {
    const weeklyEarnings = await pasajerosRepository.calculateEarningsForDateRange(fechaInicio, fechaFin, TARIFA_POR_PASAJERO);
    res.json(weeklyEarnings);
  } catch (error) {
    res.status(500).json({ message: 'Error calculando las ganancias semanales', error });
  }
};

export const getHourlyEarnings = async (req: Request, res: Response) => {
  const { fecha } = req.body;
  if (!fecha) return res.status(400).json({ message: 'Fecha es requerida' });

  try {
    const hourlyData = await pasajerosRepository.calculateHourlyEarnings(fecha, TARIFA_POR_PASAJERO);
    res.json(hourlyData);
  } catch (error) {
    res.status(500).json({ message: 'Error calculando las ganancias por hora', error });
  }
};

export const getMonthlyEarnings = async (_req: Request, res: Response) => {
  try {
    const monthlyData = await pasajerosRepository.calculateCurrentMonthEarnings(TARIFA_POR_PASAJERO);
    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ message: 'Error calculando las ganancias del mes actual', error });
  }
};
