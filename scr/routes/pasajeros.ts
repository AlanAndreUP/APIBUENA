import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuario } from '../models/usuarioSchema';
import PasajerosPorDia from '../models/pasajeros';
import Unidad from '../models/unidadSchema';
import { startOfDay, endOfDay, subDays, addMinutes, formatISO } from 'date-fns';
import signale from 'signale';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'XDEJUEMPLO';
const TARIFA_POR_PASAJERO = 20;

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

router.post('/generate', async (req: Request, res: Response) => {
  const { fecha } = req.body;

  if (!fecha) {
      return res.status(400).json({ message: 'Fecha es requerida' });
  }

  const endDate = new Date(fecha);
  const startDate = subDays(startOfDay(endDate), 7);
  
  try {
      let currentDate = startDate;

      while (currentDate < endDate) {
          let currentTime = new Date(currentDate.setHours(7, 0, 0, 0));
          const endTime = new Date(currentDate.setHours(22, 0, 0, 0));

          while (currentTime <= endTime) {
              const cantidad = Math.floor(Math.random() * 31);
              signale.info(`Generando cantidad ${cantidad} para fecha ${formatISO(currentTime)}`);

              let pasajeros = await PasajerosPorDia.findOne({ fecha: formatISO(currentTime) });
              
              if (pasajeros) {
                  pasajeros.cantidad += cantidad;
              } else {
                  pasajeros = new PasajerosPorDia({ fecha: formatISO(currentTime), cantidad });
              }

              await pasajeros.save();
              signale.success(`Guardado para ${formatISO(currentTime)}`);

              currentTime = addMinutes(currentTime, 15);
          }

          currentDate = addMinutes(new Date(currentDate.setHours(0, 0, 0, 0)), 24 * 60);
      }

      res.status(201).json({ message: 'Datos generados y registrados exitosamente' });
  } catch (error) {
      signale.error(error);
      res.status(500).json({ message: 'Error generando los datos', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
    const { fecha, cantidad } = req.body;

    try {
        let pasajeros = await PasajerosPorDia.findOne({ fecha });
        if (pasajeros) {
            pasajeros.cantidad += cantidad;
        } else {
            pasajeros = new PasajerosPorDia({ fecha, cantidad });
        }
        await pasajeros.save();
        res.status(201).json({ message: 'Cantidad de pasajeros registrada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error registrando la cantidad de pasajeros', error });
    }
});

router.get('/', async (req: Request, res: Response) => {
    const { fecha } = req.query;

    try {
        const pasajeros = await PasajerosPorDia.findOne({ fecha });
        if (!pasajeros) return res.status(400).json({ message: 'No se encontraron registros para la fecha proporcionada' });

        res.json({ fecha: pasajeros.fecha, cantidad: pasajeros.cantidad });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo la cantidad de pasajeros', error });
    }
});

router.get('/ganancias/dia', async (req: Request, res: Response) => {
    const { fecha } = req.query;

    try {
        const pasajeros = await PasajerosPorDia.findOne({ fecha });
        if (!pasajeros) return res.status(400).json({ message: 'No se encontraron registros para la fecha proporcionada' });

        const ganancias = pasajeros.cantidad * TARIFA_POR_PASAJERO;
        res.json({ fecha: pasajeros.fecha, ganancias });
    } catch (error) {
        res.status(500).json({ message: 'Error calculando las ganancias diarias', error });
    }
});
router.post('/ganancias/semana', async (req: Request, res: Response) => {
  const { fechaInicio, fechaFin } = req.body;
  console.log('Fecha Inicio:', fechaInicio);
  console.log('Fecha Fin:', fechaFin);

  try {
    const startDate = new Date(fechaInicio.replace(' ', 'T') + 'Z');
    const endDate = new Date(fechaFin.replace(' ', 'T') + 'Z');

    console.log('Fecha de Inicio Convertida:', startDate.toISOString());
    console.log('Fecha de Fin Convertida:', endDate.toISOString());

    
    const startDateStr = startDate.toISOString().replace('T', ' ').slice(0, 19);
    const endDateStr = endDate.toISOString().replace('T', ' ').slice(0, 19);
    console.log('Fecha de Inicio para Consulta:', startDateStr);
    console.log('Fecha de Fin para Consulta:', endDateStr);

    const pasajeros = await PasajerosPorDia.find({
      fecha: {
        $gte: startDateStr,
        $lte: endDateStr
      }
    }).exec();


    const TARIFA_POR_PASAJERO = 20;
    const gananciasPorDia = pasajeros.reduce((acc, dia) => {
      const day = new Date(dia.fecha).getDay();
      acc[day] = (acc[day] || 0) + (dia.cantidad * TARIFA_POR_PASAJERO);
      return acc;
    }, {} as { [key: number]: number });

    const earnings = Array(7).fill(0).map((_, i) => gananciasPorDia[i] || 0);
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    res.json({ days, earnings });
  } catch (error) {
    res.status(500).json({ message: 'Error calculando las ganancias semanales', error });
  }
});

router.post('/ganancias/horas', async (req: Request, res: Response) => {
  const { fecha } = req.body;

  if (!fecha) {
      return res.status(400).json({ message: 'Fecha es requerida' });
  }

  console.log('Fecha:', fecha);
  const currentDate = new Date(fecha);
  console.log('Fecha actual:', currentDate);
  const startOfDayDate = startOfDay(currentDate);
  const previousWeekDate = subDays(startOfDayDate, 7);

  try {
      let gananciasPorHora: { [key: number]: number } = {};
      let probabilidadesPorHora: { [key: number]: number } = {};

      const currentHour = currentDate.getUTCHours();
      console.log('Current Hour:', currentHour);
            
      const pasajerosPrevios = await PasajerosPorDia.find({
          fecha: {
              $gte: formatISO(startOfDay(previousWeekDate)),
              $lte: formatISO(endOfDay(previousWeekDate))
          }
      });
      
      const pasajerosPorHoraPrevios = pasajerosPrevios.reduce((acc, dia) => {
          const hour = new Date(dia.fecha).getHours();
          acc[hour] = (acc[hour] || 0) + dia.cantidad;
          return acc;
      }, {} as { [key: number]: number });
      
      for (let hour = 7; hour <= 21; hour++) {
          const startTime = new Date(startOfDayDate.setHours(hour, 0, 0, 0));
          const endTime = new Date(startOfDayDate.setHours(hour + 1, 0, 0, 0));

          if (hour < currentHour) {              
              const pasajerosActuales = await PasajerosPorDia.find({
                  fecha: {
                      $gte: formatISO(startTime),
                      $lte: formatISO(endTime)
                  }
              });

              const cantidadActual = pasajerosActuales.reduce((acc, dia) => acc + dia.cantidad, 0);
              const ganancias = cantidadActual * TARIFA_POR_PASAJERO;
              gananciasPorHora[hour] = ganancias;
              signale.info(`Ganancias para ${hour}:00-${hour + 1}:00 -> ${ganancias}`);
          } else {              
              const cantidadPrevios = pasajerosPorHoraPrevios[hour] || 0;
              const probabilidad = cantidadPrevios / Object.values(pasajerosPorHoraPrevios).reduce((a, b) => a + b, 0);
              probabilidadesPorHora[hour] = probabilidad;
              signale.info(`Probabilidad para ${hour}:00-${hour + 1}:00 -> ${probabilidad}`);
          }
      }

      res.json({ gananciasPorHora, probabilidadesPorHora });
  } catch (error) {
      signale.error(error);
      res.status(500).json({ message: 'Error calculando las ganancias por hora', error });
  }
});

router.get('/ganancias/mes-actual', async (req: Request, res: Response) => {
    try {
      const now = new Date();
      const primerDiaDelMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const primerDiaDelProximoMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const fechaInicio = primerDiaDelMes.toISOString().replace('T', ' ').slice(0, 19);
      const fechaFin = primerDiaDelProximoMes.toISOString().replace('T', ' ').slice(0, 19);
      const pasajeros = await PasajerosPorDia.find({
        fecha: {
          $gte: fechaInicio,
          $lt: fechaFin
        }
      }).exec();
      const gananciasTotales = pasajeros.reduce((total, dia) => {
        return total + (dia.cantidad * TARIFA_POR_PASAJERO);
      }, 0);
      const drivers = await Usuario.find({ tipo: 'cliente' }).select('-password');
      const unidades = await Unidad.find();
      res.json({
        mes: now.toLocaleString('default', { month: 'long' }),
        año: now.getFullYear(),
        gananciasTotales,
        conductores: drivers.length,
        unidades: unidades.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Error calculando las ganancias del mes actual', error });
    }
  });
export default router;
