import express, { Application } from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import cluster from 'cluster';
import { cpus } from 'os';
import { userRoute, pasajeroRoute, unidadesRoute, kitRoute } from './routes';

config();

const numCPUs = cpus().length;

class Server {
  public app: Application;
  private port: string;
  private uri: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '4000';
    this.uri = process.env.MONGODB_URI!;
  }

  async connectDB(): Promise<void> {
    try {
      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, 
        socketTimeoutMS: 45000,
        maxPoolSize: numCPUs * 2,
      } as mongoose.ConnectOptions);

      const db = mongoose.connection;

      db.on('error', (error: Error) => {
        console.error('Error en la conexión a la base de datos MongoDB:', error);
      });

      db.once('open', () => {
        console.log(`Conexión exitosa a la base de datos MongoDB. Worker ${process.pid}`);
      });
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      process.exit(1); 
    }
  }

  middlewares(): void {
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      next();
    });

    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  routes(): void {
    this.app.use('/pasajeros', pasajeroRoute);
    this.app.use('/users', userRoute);
    this.app.use('/kits', kitRoute);
    this.app.use('/unidades', unidadesRoute);
    
    this.app.get('/', (req, res) => {
      res.status(200).json({
        message: `Servidor API en ejecución en el puerto ${this.port}`,
        worker: process.pid
      });
    });
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Worker ${process.pid} iniciado en puerto ${this.port}`);
    });
  }
}


if (cluster.isPrimary) {
  console.log(`Master ${process.pid} está corriendo`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} murió`);
    cluster.fork();
  });
} else {
  const server = new Server();
  server.connectDB();
  server.middlewares();
  server.routes();
  server.listen();
}

export default cluster.isPrimary ? null : Server;