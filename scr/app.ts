import express, { Application } from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import morgan from 'morgan';
import { userRoute, pasajeroRoute, unidadesRoute, kitRoute } from './routes';

config();

class Server {
  public app: Application;
  private port: string;
  private uri: string;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '4000';
    this.uri = process.env.MONGODB_URI!;
    this.middlewares();
    this.connectDB();
    this.routes();
  }

  async connectDB(): Promise<void> {
    try {
      await mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions);

      const db = mongoose.connection;

      db.on('error', (error: Error) => {
        console.error('Error en la conexión a la base de datos MongoDB:', error);
      });

      db.once('open', () => {
        console.log('Conexión exitosa a la base de datos MongoDB.');
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
      });
    });
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor en ejecución en el puerto ${this.port}`);
    });
  }
}

const server = new Server();
server.listen();

export default server.app;
